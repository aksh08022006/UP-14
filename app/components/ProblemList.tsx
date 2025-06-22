import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Tag, ChevronRight } from "lucide-react-native";

type Problem = {
  id: string;
  name: string;
  tags: string[];
  difficulty: number;
};

type ProblemListProps = {
  contestId?: string;
  problems?: Problem[];
};

export default function ProblemList({
  contestId = "1234",
  problems: propProblems,
}: ProblemListProps) {
  const [problems, setProblems] = useState<Problem[]>(propProblems || []);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch problems from Codeforces API
  useEffect(() => {
    if (!propProblems && contestId) {
      fetchProblems();
    }
  }, [contestId, propProblems]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`,
      );
      const data = await response.json();

      if (data.status === "OK" && data.result.contest && data.result.problems) {
        const formattedProblems = data.result.problems.map((problem: any) => ({
          id: problem.index,
          name: problem.name,
          tags: problem.tags || [],
          difficulty: problem.rating || 0,
        }));
        setProblems(formattedProblems);
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
      // Fallback to mock data
      setProblems([
        {
          id: "A",
          name: "Watermelon",
          tags: ["math", "brute force"],
          difficulty: 800,
        },
        { id: "B", name: "Theatre Square", tags: ["math"], difficulty: 1000 },
        {
          id: "C",
          name: "Team",
          tags: ["greedy", "implementation"],
          difficulty: 1200,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const navigateToProblem = (problemId: string) => {
    router.push(`/contest/${contestId}/problem/${problemId}`);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 1000) return "text-gray-500";
    if (difficulty < 1200) return "text-green-600";
    if (difficulty < 1400) return "text-cyan-600";
    if (difficulty < 1600) return "text-blue-600";
    if (difficulty < 1900) return "text-purple-600";
    if (difficulty < 2100) return "text-orange-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <View className="bg-white p-4 rounded-md shadow-sm w-full">
        <Text className="text-lg font-bold text-center">
          Loading problems...
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white p-4 rounded-md shadow-sm w-full">
      <Text className="text-xl font-bold mb-4 text-blue-800">Problems</Text>

      {/* Header Row */}
      <View className="flex-row border-b border-gray-200 py-2 bg-gray-50">
        <Text className="w-12 font-medium text-gray-700">#</Text>
        <Text className="flex-1 font-medium text-gray-700">Name</Text>
        <Text className="w-24 font-medium text-gray-700">Tags</Text>
        <Text className="w-24 font-medium text-gray-700 text-center">
          Difficulty
        </Text>
        <Text className="w-12"></Text>
      </View>

      <ScrollView className="max-h-[500px]">
        {problems.map((problem) => (
          <TouchableOpacity
            key={problem.id}
            className="flex-row items-center border-b border-gray-100 py-3 hover:bg-gray-50"
            onPress={() => navigateToProblem(problem.id)}
          >
            <Text className="w-12 font-medium text-blue-600">{problem.id}</Text>
            <Text className="flex-1 text-gray-800">{problem.name}</Text>
            <View className="w-24 flex-row flex-wrap">
              {problem.tags.slice(0, 2).map((tag, index) => (
                <View key={index} className="flex-row items-center mr-1 mb-1">
                  <Tag size={12} color="#6b7280" />
                  <Text className="text-xs text-gray-500 ml-1">{tag}</Text>
                </View>
              ))}
              {problem.tags.length > 2 && (
                <Text className="text-xs text-gray-400">
                  +{problem.tags.length - 2}
                </Text>
              )}
            </View>
            <Text
              className={`w-24 text-center ${getDifficultyColor(problem.difficulty)}`}
            >
              {problem.difficulty}
            </Text>
            <View className="w-12 items-center">
              <ChevronRight size={16} color="#6b7280" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
