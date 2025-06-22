import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ChevronDown, Play, AlertTriangle } from "lucide-react-native";
import { WebView } from "react-native-webview";
import axios from "axios";

interface CodeSolutionProps {
  problemId?: string;
  contestId?: string;
  code?: string;
  language?: string;
  problemStatement?: string;
  examples?: { input: string; output: string }[];
}

interface EdgeCase {
  description: string;
  input: string;
  expectedBehavior: string;
  severity: "low" | "medium" | "high";
}

interface AIAnalysis {
  edgeCases: EdgeCase[];
  complexity: string;
  suggestions: string[];
  potentialIssues: string[];
}

const CodeSolution = ({
  problemId = "A",
  contestId = "1234",
  code = `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> a(n);
  for (int i = 0; i < n; i++) {
    cin >> a[i];
  }
  sort(a.begin(), a.end());
  int ans = 0;
  for (int i = 0; i < n; i++) {
    ans += a[i];
  }
  cout << ans << endl;
  return 0;
}`,
  language = "C++",
  problemStatement = "Sample problem statement",
  examples = [],
}: CodeSolutionProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [userCode, setUserCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [aiJudgeFeedback, setAiJudgeFeedback] = useState("");
  const [isJudging, setIsJudging] = useState(false);

  const languages = ["C++", "Python", "Java", "JavaScript", "Go"];

  const sampleCodes = {
    "C++": `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
  int n;
  cin >> n;
  vector<int> a(n);
  for (int i = 0; i < n; i++) {
    cin >> a[i];
  }
  sort(a.begin(), a.end());
  int ans = 0;
  for (int i = 0; i < n; i++) {
    ans += a[i];
  }
  cout << ans << endl;
  return 0;
}`,
    Python: `n = int(input())
a = list(map(int, input().split()))
a.sort()
ans = sum(a)
print(ans)`,
    Java: `import java.util.*;

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    int[] a = new int[n];
    for (int i = 0; i < n; i++) {
      a[i] = sc.nextInt();
    }
    Arrays.sort(a);
    int ans = 0;
    for (int i = 0; i < n; i++) {
      ans += a[i];
    }
    System.out.println(ans);
  }
}`,
    JavaScript: `const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let lines = [];
rl.on('line', (line) => {
  lines.push(line);
});

rl.on('close', () => {
  const n = parseInt(lines[0]);
  const a = lines[1].split(' ').map(Number);
  a.sort((a, b) => a - b);
  const ans = a.reduce((sum, val) => sum + val, 0);
  console.log(ans);
});`,
    Go: `package main

import (
  "fmt"
  "sort"
)

func main() {
  var n int
  fmt.Scan(&n)
  a := make([]int, n)
  for i := 0; i < n; i++ {
    fmt.Scan(&a[i])
  }
  sort.Ints(a)
  ans := 0
  for i := 0; i < n; i++ {
    ans += a[i]
  }
  fmt.Println(ans)
}`,
  };

  const currentCode = userCode || sampleCodes[selectedLanguage as keyof typeof sampleCodes] || code;

  const analyzeCodeWithAI = async () => {
    if (!userCode.trim()) {
      Alert.alert("Error", "Please enter your code first");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Simulate AI analysis - In a real app, this would call an AI service like OpenAI
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockAnalysis: AIAnalysis = {
        edgeCases: [
          {
            description: "Empty input or zero elements",
            input: "0\n",
            expectedBehavior: "Should handle empty arrays gracefully",
            severity: "high",
          },
          {
            description: "Single element array",
            input: "1\n5",
            expectedBehavior: "Should return the single element",
            severity: "medium",
          },
          {
            description: "Large input values",
            input: "3\n1000000000 999999999 1000000000",
            expectedBehavior: "Check for integer overflow",
            severity: "high",
          },
          {
            description: "Negative numbers",
            input: "3\n-5 -10 -3",
            expectedBehavior: "Should handle negative values correctly",
            severity: "medium",
          },
        ],
        complexity:
          "Time: O(n log n) due to sorting, Space: O(n) for array storage",
        suggestions: [
          "Consider using long long in C++ to prevent integer overflow",
          "Add input validation for array bounds",
          "Handle edge case when n = 0",
        ],
        potentialIssues: [
          "Integer overflow for large sums",
          "No input validation",
          "Assumes valid input format",
        ],
      };

      setAiAnalysis(mockAnalysis);
      setShowAnalysis(true);
    } catch (error) {
      Alert.alert("Error", "Failed to analyze code. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const languageMap = {
    "C++": 54,
    Python: 71,
    Java: 62,
    JavaScript: 63,
    Go: 60,
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    try {
      const res = await axios.post("http://localhost:5000/run-code", {
        source_code: userCode,
        language_id: languageMap[selectedLanguage as keyof typeof languageMap],
        stdin: customInput,
      });
      setOutput(res.data.stdout || res.data.stderr || JSON.stringify(res.data));
    } catch (e: any) {
      setOutput(e.message);
    } finally {
      setIsRunning(false);
    }
  };

  const checkWithAI = async () => {
    setIsChecking(true);
    setAiFeedback("");
    try {
      const prompt = `You are given the following programming problem:\n${problemStatement}\n\nHere is a user's code:\n${userCode}\n\nDoes this code correctly solve the problem? If not, explain why. Suggest improvements if needed.`;
      const res = await axios.post("http://localhost:5000/ai-analyze", { prompt });
      setAiFeedback(res.data.choices?.[0]?.message?.content || JSON.stringify(res.data));
    } catch (e: any) {
      setAiFeedback(e.message);
    } finally {
      setIsChecking(false);
    }
  };

  const runAIJudge = async () => {
    setIsJudging(true);
    setAiJudgeFeedback("");
    try {
      const testCases = (examples || []).map((ex) => ({ input: ex.input, expected: ex.output }));
      const res = await axios.post("http://localhost:5000/ai-judge", {
        problem: problemStatement,
        code: userCode,
        language_id: languageMap[selectedLanguage as keyof typeof languageMap],
        testCases,
      });
      setAiJudgeFeedback(res.data.ai.choices?.[0]?.message?.content || JSON.stringify(res.data));
    } catch (e: any) {
      setAiJudgeFeedback(e.message);
    } finally {
      setIsJudging(false);
    }
  };

  // Generate HTML with syntax highlighting using Prism.js
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism.min.css" rel="stylesheet" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-core.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/plugins/autoloader/prism-autoloader.min.js"></script>
      <style>
        body {
          margin: 0;
          padding: 10px;
          background-color: #f8f9fa;
          font-family: monospace;
        }
        pre {
          margin: 0;
          counter-reset: line;
        }
        code {
          counter-increment: line;
          display: block;
          position: relative;
          padding-left: 3.5em;
        }
        code:before {
          content: counter(line);
          position: absolute;
          left: 0;
          width: 2.5em;
          text-align: right;
          color: #999;
          padding-right: 1em;
          border-right: 1px solid #ddd;
        }
      </style>
    </head>
    <body>
      <pre><code class="language-${selectedLanguage.toLowerCase()}">${currentCode.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")}</code></pre>
      <script>
        // Manually trigger Prism highlighting
        document.addEventListener('DOMContentLoaded', function() {
          Prism.highlightAll();
        });
      </script>
    </body>
    </html>
  `;

  return (
    <ScrollView className="bg-white flex-1 p-4 rounded-md shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-blue-800">
          Solution for Problem {problemId} (Contest {contestId})
        </Text>

        <View className="relative">
          <TouchableOpacity
            className="flex-row items-center bg-gray-100 px-3 py-2 rounded-md"
            onPress={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
          >
            <Text className="mr-2">{selectedLanguage}</Text>
            <ChevronDown size={16} color="#333" />
          </TouchableOpacity>

          {isLanguageDropdownOpen && (
            <View className="absolute top-10 right-0 bg-white shadow-md rounded-md z-10 w-40">
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  className={`px-4 py-2 ${selectedLanguage === lang ? "bg-blue-100" : ""}`}
                  onPress={() => {
                    setSelectedLanguage(lang);
                    setIsLanguageDropdownOpen(false);
                    setUserCode(""); // Clear user code when language changes
                  }}
                >
                  <Text>{lang}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Code Input Section */}
      <View className="mb-4">
        <Text className="text-md font-bold mb-2">Enter Your Code:</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-3 h-40 text-sm font-mono"
          multiline
          placeholder={`Enter your ${selectedLanguage} code here...`}
          value={userCode}
          onChangeText={setUserCode}
          textAlignVertical="top"
        />
        <Text className="text-md font-bold mb-2 mt-4">Custom Input:</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-3 h-20 text-sm font-mono mb-2"
          multiline
          placeholder="Enter custom input for your code"
          value={customInput}
          onChangeText={setCustomInput}
          textAlignVertical="top"
        />
        <TouchableOpacity
          className="bg-green-600 px-4 py-2 rounded-md mt-2 flex-row items-center justify-center"
          onPress={runCode}
          disabled={isRunning}
        >
          <Text className="text-white font-bold ml-2">
            {isRunning ? "Running..." : "Run Code"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-purple-600 px-4 py-2 rounded-md mt-2 flex-row items-center justify-center"
          onPress={checkWithAI}
          disabled={isChecking}
        >
          <Text className="text-white font-bold ml-2">
            {isChecking ? "Checking..." : "AI Check"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-pink-600 px-4 py-2 rounded-md mt-2 flex-row items-center justify-center"
          onPress={runAIJudge}
          disabled={isJudging}
        >
          <Text className="text-white font-bold ml-2">
            {isJudging ? "Judging..." : "AI Judge"}
          </Text>
        </TouchableOpacity>
        <Text className="text-md font-bold mt-4 mb-2">Output:</Text>
        <Text
          className="border border-gray-300 rounded-md p-3 min-h-[60px] text-sm font-mono bg-black text-green-300"
        >
          {output}
        </Text>
        <Text className="text-md font-bold mt-4 mb-2">AI Feedback:</Text>
        <Text
          className="border border-gray-300 rounded-md p-3 min-h-[60px] text-sm font-mono bg-black text-purple-200"
        >
          {aiFeedback}
        </Text>
        <Text className="text-md font-bold mt-4 mb-2">AI Judge Feedback:</Text>
        <Text
          className="border border-gray-300 rounded-md p-3 min-h-[60px] text-sm font-mono bg-black text-pink-200"
        >
          {aiJudgeFeedback}
        </Text>
      </View>

      {/* AI Analysis Results */}
      {aiAnalysis && showAnalysis && (
        <View className="mb-4 p-4 bg-gray-50 rounded-md">
          <Text className="text-lg font-bold mb-3 text-green-700">
            AI Analysis Results
          </Text>

          {/* Edge Cases */}
          <View className="mb-4">
            <Text className="text-md font-bold mb-2 flex-row items-center">
              <AlertTriangle size={16} color="#f59e0b" />
              <Text className="ml-1">Edge Cases Identified:</Text>
            </Text>
            {aiAnalysis.edgeCases.map((edgeCase, index) => (
              <View
                key={index}
                className="mb-3 p-3 bg-white rounded border-l-4"
                style={{ borderLeftColor: getSeverityColor(edgeCase.severity) }}
              >
                <Text
                  className="font-bold text-sm"
                  style={{ color: getSeverityColor(edgeCase.severity) }}
                >
                  {edgeCase.severity.toUpperCase()} PRIORITY
                </Text>
                <Text className="font-bold mb-1">{edgeCase.description}</Text>
                <Text className="text-sm text-gray-600 mb-1">
                  Input: {edgeCase.input}
                </Text>
                <Text className="text-sm">{edgeCase.expectedBehavior}</Text>
              </View>
            ))}
          </View>

          {/* Complexity Analysis */}
          <View className="mb-4">
            <Text className="text-md font-bold mb-2">Complexity Analysis:</Text>
            <Text className="text-sm bg-white p-2 rounded">
              {aiAnalysis.complexity}
            </Text>
          </View>

          {/* Suggestions */}
          <View className="mb-4">
            <Text className="text-md font-bold mb-2">Suggestions:</Text>
            {aiAnalysis.suggestions.map((suggestion, index) => (
              <Text key={index} className="text-sm mb-1 bg-white p-2 rounded">
                • {suggestion}
              </Text>
            ))}
          </View>

          {/* Potential Issues */}
          <View>
            <Text className="text-md font-bold mb-2">Potential Issues:</Text>
            {aiAnalysis.potentialIssues.map((issue, index) => (
              <Text
                key={index}
                className="text-sm mb-1 bg-white p-2 rounded text-red-600"
              >
                ⚠ {issue}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Code Display */}
      <View className="mb-4">
        <Text className="text-md font-bold mb-2">
          {userCode ? "Your Code:" : "Sample Code:"}
        </Text>
        <View className="h-80 border border-gray-300 rounded-md overflow-hidden">
          <WebView
            originWhitelist={["*"]}
            source={{ html: htmlContent }}
            style={{ backgroundColor: "#f8f9fa" }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default CodeSolution;
