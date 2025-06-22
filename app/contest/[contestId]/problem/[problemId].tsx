import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import CodeSolution from "../../../components/CodeSolution";

interface Problem {
  id: string;
  contestId: string;
  title: string;
  timeLimit: string;
  memoryLimit: string;
  inputFile: string;
  outputFile: string;
  description: string;
  inputDescription: string;
  outputDescription: string;
  examples: { input: string; output: string }[];
  note?: string;
}

export default function ProblemDetailPage() {
  const { contestId, problemId } = useLocalSearchParams<{
    contestId: string;
    problemId: string;
  }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("problem"); // 'problem' or 'solution'
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contestId && problemId) {
      fetchProblemData();
    }
  }, [contestId, problemId]);

  const fetchProblemData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`,
      );
      const data = await response.json();

      if (data.status === "OK" && data.result.problems) {
        const problemData = data.result.problems.find(
          (p: any) => p.index === problemId,
        );
        if (problemData) {
          setProblem({
            id: problemData.index,
            contestId: contestId || "1234",
            title: problemData.name,
            timeLimit: `${problemData.timeLimit || 1000}ms`,
            memoryLimit: `${problemData.memoryLimit || 256} MB`,
            inputFile: "standard input",
            outputFile: "standard output",
            description: `Problem ${problemData.index}: ${problemData.name}\n\nThis is a Codeforces problem. Visit the official Codeforces website to view the complete problem statement.`,
            inputDescription:
              "Please refer to the official Codeforces problem statement for input format.",
            outputDescription:
              "Please refer to the official Codeforces problem statement for output format.",
            examples: [{ input: "Sample input", output: "Sample output" }],
            note:
              "For complete problem statement and examples, visit: https://codeforces.com/contest/" +
              contestId +
              "/problem/" +
              problemId,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching problem data:", error);
      // Fallback to mock data
      setProblem({
        id: problemId || "A",
        contestId: contestId || "1234",
        title: "Watermelon",
        timeLimit: "1 second",
        memoryLimit: "256 megabytes",
        inputFile: "standard input",
        outputFile: "standard output",
        description: `One hot summer day Pete and his friend Billy decided to buy a watermelon. They chose the biggest and the ripest one, in their opinion. After that the watermelon was weighed, and the scales showed w kilos. They rushed home, dying of thirst, and decided to divide the berry, however they faced a hard problem.\n\nPete and Billy are great fans of even numbers, that's why they want to divide the watermelon in such a way that each of the two parts weighs even number of kilos, at the same time it is not obligatory that the parts are equal. The boys are extremely tired and want to start their meal as soon as possible, that's why you should help them and find out, if they can divide the watermelon in the way they want. For sure, each of them should get a part of positive weight.`,
        inputDescription:
          "The first (and the only) input line contains integer number w (1 ≤ w ≤ 100) — the weight of the watermelon bought by the boys.",
        outputDescription:
          "Print YES, if the boys can divide the watermelon into two parts, each of them weighing even number of kilos; and NO in the opposite case.",
        examples: [
          { input: "8", output: "YES" },
          { input: "5", output: "NO" },
        ],
        note: "For example, the boys can divide the watermelon into two parts of 2 and 6 kilos respectively (another variant — two parts of 4 and 4 kilos).",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !problem) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg font-bold">Loading problem...</Text>
      </View>
    );
  }

  // Navigation to previous/next problems
  const navigateToProblem = (direction: "prev" | "next") => {
    // This would be implemented with actual navigation in a real app
    console.log(`Navigate to ${direction} problem`);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Back to Problems button */}
      <View className="p-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => router.push(`/contest/${contestId}`)}
        >
          <ChevronLeft size={20} color="#4b7bab" />
          <Text className="text-[#4b7bab] ml-2 font-bold">Back to Problems</Text>
        </TouchableOpacity>
      </View>

      {/* Contest navigation header */}
      <View className="bg-[#4b7bab] p-4">
        <Text className="text-white text-lg font-bold">
          Codeforces Round #{problem.contestId}
        </Text>
        <View className="flex-row mt-2">
          <TouchableOpacity className="mr-4">
            <Text className="text-white">Problems</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Problem navigation */}
      <View className="flex-row justify-between items-center p-4 bg-gray-100 border-b border-gray-300">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => navigateToProblem("prev")}
        >
          <ChevronLeft size={20} color="#4b7bab" />
          <Text className="text-[#4b7bab]">Previous</Text>
        </TouchableOpacity>

        <Text className="text-lg font-bold">
          {problem.id}. {problem.title}
        </Text>

        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => navigateToProblem("next")}
        >
          <Text className="text-[#4b7bab]">Next</Text>
          <ChevronRight size={20} color="#4b7bab" />
        </TouchableOpacity>
      </View>

      {/* Tab navigation */}
      <View className="flex-row border-b border-gray-300">
        <TouchableOpacity
          className={`p-4 border-b-2 border-[#4b7bab]`}
        >
          <Text className={`text-[#4b7bab] font-bold`}>
            Problem
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 p-4">
        {/* Problem statement */}
        <View className="mb-6">
          <Text className="text-2xl font-bold mb-2">
            {problem.id}. {problem.title}
          </Text>
          <Text className="text-gray-600 mb-1">
            time limit per test: {problem.timeLimit}
          </Text>
          <Text className="text-gray-600 mb-1">
            memory limit per test: {problem.memoryLimit}
          </Text>
          <Text className="text-gray-600 mb-1">
            input: {problem.inputFile}
          </Text>
          <Text className="text-gray-600 mb-4">
            output: {problem.outputFile}
          </Text>
          <Text className="mb-4">{problem.description}</Text>
          {problem.note && (
            <View>
              <Text className="font-bold mb-2">Note</Text>
              <Text>{problem.note}</Text>
            </View>
          )}
        </View>
        {/* Solution/Code editor */}
        <CodeSolution
          problemId={problemId || "A"}
          contestId={contestId || "1234"}
          problemStatement={problem.description}
          problemTitle={problem.title}
          timeLimit={problem.timeLimit}
          memoryLimit={problem.memoryLimit}
          inputDescription={problem.inputDescription}
          outputDescription={problem.outputDescription}
          examples={problem.examples}
          note={problem.note}
        />
      </View>
    </ScrollView>
  );
}
