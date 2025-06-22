import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';
import './App.css';

const languages = [
  { name: 'C++', id: 54 },
  { name: 'Python', id: 71 },
  { name: 'Java', id: 62 },
  { name: 'JavaScript', id: 63 },
  { name: 'Go', id: 60 },
];

function App() {
  const [code, setCode] = useState('// write your code here');
  const [language, setLanguage] = useState(languages[0]);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [problemUrl, setProblemUrl] = useState('');
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch problem from Codeforces
  const fetchProblem = async () => {
    try {
      setLoading(true);
      // Example: https://codeforces.com/problemset/problem/1234/A
      const match = problemUrl.match(/problem\/(\d+)\/(\w+)/);
      if (!match) throw new Error('Invalid URL');
      const contestId = match[1];
      const index = match[2];
      const res = await axios.get('https://codeforces.com/api/problemset.problems');
      const problems = res.data.result.problems;
      const found = problems.find((p: any) => p.contestId == contestId && p.index == index);
      setProblem(found || null);
    } catch (e) {
      setProblem(null);
      alert('Problem not found!');
    } finally {
      setLoading(false);
    }
  };

  // Run code via backend
  const runCode = async () => {
    setLoading(true);
    setOutput('');
    try {
      const res = await axios.post('http://localhost:5000/run-code', {
        source_code: code,
        language_id: language.id,
        stdin: input,
      });
      setOutput(res.data.stdout || res.data.stderr || JSON.stringify(res.data));
    } catch (e: any) {
      setOutput(e.message);
    } finally {
      setLoading(false);
    }
  };

  // AI analysis via backend
  const analyzeAI = async () => {
    setAiLoading(true);
    setAiResult('');
    try {
      const prompt = `You are given a Codeforces problem with the following description:\n${problem?.name || ''}\n${problem?.statement || ''}\nCode:\n${code}\nGenerate 3 tricky input test cases that are not in the sample.`;
      const res = await axios.post('http://localhost:5000/ai-analyze', { prompt });
      setAiResult(res.data.choices?.[0]?.message?.content || JSON.stringify(res.data));
    } catch (e: any) {
      setAiResult(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Codeforces Code Tester</h1>
        <div className="mb-4 flex gap-2">
          <input
            className="border p-2 flex-1 rounded"
            placeholder="Paste Codeforces problem URL"
            value={problemUrl}
            onChange={e => setProblemUrl(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={fetchProblem} disabled={loading}>
            Fetch Problem
          </button>
        </div>
        {problem && (
          <div className="mb-4 p-2 bg-blue-50 rounded">
            <div className="font-bold">{problem.name}</div>
            <div>Contest: {problem.contestId} | Index: {problem.index}</div>
            <div>Tags: {problem.tags.join(', ')}</div>
          </div>
        )}
        <div className="mb-4 flex gap-2 items-center">
          <label className="font-semibold">Language:</label>
          <select
            className="border p-2 rounded"
            value={language.name}
            onChange={e => setLanguage(languages.find(l => l.name === e.target.value) || languages[0])}
          >
            {languages.map(l => (
              <option key={l.id} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <MonacoEditor
            height="300px"
            defaultLanguage={language.name.toLowerCase()}
            value={code}
            onChange={v => setCode(v || '')}
            theme="vs-dark"
          />
        </div>
        <div className="mb-4">
          <label className="font-semibold">Custom Input:</label>
          <textarea
            className="border p-2 rounded w-full min-h-[60px]"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mb-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={runCode} disabled={loading}>
            {loading ? 'Running...' : 'Run Code'}
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={analyzeAI} disabled={aiLoading}>
            {aiLoading ? 'Analyzing...' : 'AI Analyze'}
          </button>
        </div>
        <div className="mb-4">
          <label className="font-semibold">Output:</label>
          <pre className="bg-gray-900 text-green-300 p-2 rounded min-h-[60px] whitespace-pre-wrap">{output}</pre>
        </div>
        <div className="mb-4">
          <label className="font-semibold">AI Result:</label>
          <pre className="bg-gray-900 text-purple-200 p-2 rounded min-h-[60px] whitespace-pre-wrap">{aiResult}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;
