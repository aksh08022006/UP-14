import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, Link, Stack } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import ProblemList from "../components/ProblemList";

interface ContestData {
  id: string;
  name: string;
  startTime: string;
  duration: string;
  writer: string;
  description: string;
}

export default function ContestPage() {
  const { contestId } = useLocalSearchParams<{ contestId: string }>();
  const [contestData, setContestData] = useState<ContestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contestId) {
      fetchContestData();
    }
  }, [contestId]);

  const fetchContestData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://codeforces.com/api/contest.list`);
      const data = await response.json();

      if (data.status === "OK") {
        const contest = data.result.find(
          (c: any) => c.id.toString() === contestId,
        );
        if (contest) {
          setContestData({
            id: contest.id.toString(),
            name: contest.name,
            startTime: new Date(
              contest.startTimeSeconds * 1000,
            ).toLocaleString(),
            duration: `${Math.floor(contest.durationSeconds / 3600)} hours ${Math.floor((contest.durationSeconds % 3600) / 60)} minutes`,
            writer: "Prepared by Codeforces",
            description: contest.description || "Official Codeforces contest.",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching contest data:", error);
      // Fallback to mock data
      setContestData({
        id: contestId || "1234",
        name: `Codeforces Round #${contestId || "789"} (Div. 2)`,
        startTime: "May 15, 2023 17:35",
        duration: "2 hours",
        writer: "Prepared by CodeForces",
        description:
          "This is a regular Codeforces round for participants with rating less than 2100.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !contestData) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg font-bold">Loading contest...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: contestData.name }} />

      {/* Header */}
      <View className="bg-[#1976d2] p-4">
        <View className="flex-row items-center justify-between">
          <Link href="/" asChild>
            <TouchableOpacity className="flex-row items-center">
              <ChevronLeft size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-2">
                Back to Contests
              </Text>
            </TouchableOpacity>
          </Link>
          <Text className="text-white text-lg font-bold">Codeforces</Text>
        </View>
      </View>

      {/* Contest Navigation */}
      <View className="bg-[#f1f1f1] p-4 border-b border-gray-300">
        <View className="flex-row space-x-4">
          <TouchableOpacity className="bg-[#e0e0e0] px-3 py-2 rounded">
            <Text className="font-medium">Problems</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-3 py-2">
            <Text className="text-[#1976d2]">Standings</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-3 py-2">
            <Text className="text-[#1976d2]">Custom Invocation</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contest Info */}
      <ScrollView className="flex-1">
        <View className="p-4 bg-white">
          <Text className="text-2xl font-bold mb-4">{contestData.name}</Text>

          <View className="bg-[#f8f9fa] p-4 rounded-md mb-6">
            <View className="flex-row mb-2">
              <Text className="font-bold w-24">Start:</Text>
              <Text>{contestData.startTime}</Text>
            </View>
            <View className="flex-row mb-2">
              <Text className="font-bold w-24">Duration:</Text>
              <Text>{contestData.duration}</Text>
            </View>
            <View className="flex-row mb-2">
              <Text className="font-bold w-24">Writer:</Text>
              <Text>{contestData.writer}</Text>
            </View>
            <View className="flex-row">
              <Text className="font-bold w-24">Description:</Text>
              <Text>{contestData.description}</Text>
            </View>
          </View>

          {/* Problem List Component */}
          <Text className="text-xl font-bold mb-4">Problems</Text>
          <ProblemList contestId={contestData.id} />
        </View>
      </ScrollView>
    </View>
  );
}
