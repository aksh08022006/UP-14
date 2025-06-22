import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { Search, ChevronDown } from "lucide-react-native";
import ContestList from "./components/ContestList";

export default function LandingPage() {
  return (
    <View className="flex-1 bg-white">
      {/* Header - Codeforces-like blue header */}
      <View className="bg-[#1976D2] px-4 py-3">
        <Text className="text-white text-xl font-bold">CODEFORCES ANSWERS</Text>
      </View>
      {/* Main content */}
      <ScrollView className="flex-1 px-4 py-6">
        <View className="bg-white border border-gray-300 rounded-md overflow-hidden">
          <View className="bg-[#E1E7F0] px-4 py-3 border-b border-gray-300">
            <Text className="text-lg font-medium">Contest List</Text>
          </View>
          <View className="p-4">
            <Text className="text-gray-700 mb-4">
              Welcome! Browse the contests below and click on any contest to view its problems.
            </Text>
            {/* Contest List Component */}
            <ContestList />
          </View>
        </View>
      </ScrollView>
      {/* Footer */}
      <View className="bg-[#F8F9FA] border-t border-gray-300 px-4 py-3">
        <Text className="text-center text-gray-600 text-sm">
          © 2023-2024 Codeforces Answers | Not affiliated with the official Codeforces platform
        </Text>
      </View>
    </View>
  );
}
