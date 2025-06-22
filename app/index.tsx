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
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-white text-xl font-bold">CODEFORCES</Text>
            <Text className="text-white text-xl ml-1 font-normal">ANSWERS</Text>
          </View>

          <View className="flex-row items-center">
            <Link href="/" asChild>
              <TouchableOpacity className="mr-4">
                <Text className="text-white">Home</Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity
              className="mr-4"
              onPress={() => console.log("Navigate to contests")}
            >
              <Text className="text-white">Contests</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mr-4"
              onPress={() => console.log("Navigate to problems")}
            >
              <Text className="text-white">Problems</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mr-4"
              onPress={() => console.log("Navigate to about")}
            >
              <Text className="text-white">About</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center bg-white rounded-md px-2 py-1">
            <Search size={16} color="#666" />
            <Text className="text-gray-400 ml-2">Search...</Text>
          </View>
        </View>
      </View>

      {/* Secondary navigation */}
      <View className="bg-[#F8F9FA] border-b border-gray-300 px-4 py-2">
        <View className="flex-row">
          <TouchableOpacity className="flex-row items-center mr-4">
            <Text className="text-[#1976D2]">CONTESTS</Text>
            <ChevronDown size={16} color="#1976D2" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center mr-4">
            <Text className="text-[#1976D2]">PROBLEMSET</Text>
            <ChevronDown size={16} color="#1976D2" />
          </TouchableOpacity>
          <TouchableOpacity className="mr-4">
            <Text className="text-[#1976D2]">GROUPS</Text>
          </TouchableOpacity>
          <TouchableOpacity className="mr-4">
            <Text className="text-[#1976D2]">RATINGS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content */}
      <ScrollView className="flex-1 px-4 py-6">
        <View className="bg-white border border-gray-300 rounded-md overflow-hidden">
          <View className="bg-[#E1E7F0] px-4 py-3 border-b border-gray-300">
            <Text className="text-lg font-medium">Contest List</Text>
          </View>

          <View className="p-4">
            <Text className="text-gray-700 mb-4">
              Welcome to Codeforces Answers! Here you can check solutions for
              ongoing and past contests without requiring login. Browse the
              contests below and click on any contest to view its problems. Data
              is fetched live from the official Codeforces API.
            </Text>

            <View className="bg-blue-50 p-3 rounded-md mb-4">
              <Text className="text-blue-800 font-medium mb-1">
                🔗 Official Codeforces Links:
              </Text>
              <Text className="text-blue-600 text-sm">
                • Main site: https://codeforces.com
              </Text>
              <Text className="text-blue-600 text-sm">
                • API Documentation: https://codeforces.com/apiHelp
              </Text>
            </View>

            {/* Contest List Component */}
            <ContestList />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="bg-[#F8F9FA] border-t border-gray-300 px-4 py-3">
        <Text className="text-center text-gray-600 text-sm">
          © 2023-2024 Codeforces Answers | Not affiliated with the official
          Codeforces platform
        </Text>
      </View>
    </View>
  );
}
