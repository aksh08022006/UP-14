require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { execFile } = require('child_process');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// POST /run-code: Send code to Judge0
app.post('/run-code', async (req, res) => {
  const { source_code, language_id, stdin } = req.body;
  try {
    const response = await axios.post(
      'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
      { source_code, language_id, stdin },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /ai-analyze: Use OpenAI to analyze code
app.post('/ai-analyze', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /ai-judge: Run code on all test cases and get AI feedback
app.post('/ai-judge', async (req, res) => {
  const { problem, code, testCases, language_id } = req.body;
  try {
    // Run code on all test cases using Judge0
    const results = await Promise.all(testCases.map(async (tc) => {
      try {
        const response = await axios.post(
          'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
          {
            source_code: code,
            language_id,
            stdin: tc.input,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            },
          }
        );
        return {
          input: tc.input,
          expected: tc.expected,
          output: response.data.stdout || response.data.stderr || '',
        };
      } catch (err) {
        return {
          input: tc.input,
          expected: tc.expected,
          output: 'Error running code',
        };
      }
    }));

    // Prepare prompt for OpenAI
    let prompt = `Problem: ${problem}\nCode:\n${code}\nTest cases and results:\n`;
    results.forEach((r, i) => {
      prompt += `${i + 1}. Input: ${r.input}\nExpected: ${r.expected}\nGot: ${r.output}\n`;
    });
    prompt += '\nPlease tell the user which test cases failed and why, and suggest fixes.';

    // Send to OpenAI
    const aiRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    res.json({ ai: aiRes.data, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper: Scrape input format and constraints from Codeforces problem page
async function scrapeProblem(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const inputFormat = $('.input-specification').text();
  // Try to extract constraint lines from the statement
  const statementText = $('.problem-statement').text();
  const constraints = statementText.match(/\d+\s*[≤<=]\s*\w+(?:\[i\])?\s*[≤<=]\s*\d+/g) || [];
  return { inputFormat, constraints };
}

// Helper: Parse constraints into JSON
function parseConstraints(constraintLines) {
  const result = {};
  for (const line of constraintLines) {
    const match = line.match(/(\d+)\s*[≤<=]\s*(\w+(?:\[i\])?)\s*[≤<=]\s*(\d+)/);
    if (match) {
      result[match[2]] = { min: Number(match[1]), max: Number(match[3]) };
    }
  }
  return result;
}

// Helper: Generate test cases
function generateTestCases(constraints) {
  // Example for n and a[i]
  const n = constraints['n'] || { min: 1, max: 10 };
  const a = constraints['a[i]'] || { min: 1, max: 100 };
  // Edge case: n = 1, a[i] = a.min
  const edge1 = `1\n${a.min}\n`;
  // Edge case: n = n.max, all a[i] = a.max
  const edge2 = `${n.max}\n${Array(n.max).fill(a.max).join(' ')}\n`;
  // Random case
  const randN = Math.floor(Math.random() * (n.max - n.min + 1)) + n.min;
  const randA = Array(randN).fill(0).map(() => Math.floor(Math.random() * (a.max - a.min + 1)) + a.min).join(' ');
  const random = `${randN}\n${randA}\n`;
  // All elements same
  const allSame = `${n.max}\n${Array(n.max).fill(a.min).join(' ')}\n`;
  // Sorted
  const sorted = `${n.max}\n${Array.from({length: n.max}, (_, i) => a.min + i).join(' ')}\n`;
  // Reverse sorted
  const revSorted = `${n.max}\n${Array.from({length: n.max}, (_, i) => a.max - i).join(' ')}\n`;
  return [edge1, edge2, random, allSame, sorted, revSorted];
}

// API endpoint
app.post('/api/generate-tests', async (req, res) => {
  try {
    const { url } = req.body;
    const { inputFormat, constraints } = await scrapeProblem(url);
    const parsed = parseConstraints(constraints);
    const testCases = generateTestCases(parsed);
    res.json({ testCases });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 