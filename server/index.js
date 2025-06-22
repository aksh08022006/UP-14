require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 