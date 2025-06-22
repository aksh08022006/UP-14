import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";
import { ChevronDown, ChevronUp, Clock, Calendar } from "lucide-react-native";

interface Contest {
  id: string;
  name: string;
  startTime: string;
  duration: string;
  status: "Upcoming" | "Running" | "Finished";
}

interface ContestListProps {
  contests?: Contest[];
  loading?: boolean;
}

export default function ContestList({
  contests: propContests,
  loading: propLoading = false,
}: ContestListProps) {
  const [contests, setContests] = useState<Contest[]>(propContests || []);
  const [loading, setLoading] = useState(propLoading);
  const [sortField, setSortField] = useState<"name" | "startTime">("startTime");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const contestsPerPage = 10;

  // Fetch contests from Codeforces API
  useEffect(() => {
    if (!propContests) {
      fetchContests();
    }
  }, [propContests]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://codeforces.com/api/contest.list");
      const data = await response.json();

      if (data.status === "OK") {
        const formattedContests = data.result
          .slice(0, 50)
          .map((contest: any) => ({
            id: contest.id.toString(),
            name: contest.name,
            startTime: new Date(
              contest.startTimeSeconds * 1000,
            ).toLocaleString(),
            duration: `${Math.floor(contest.durationSeconds / 3600)}:${String(Math.floor((contest.durationSeconds % 3600) / 60)).padStart(2, "0")}`,
            status:
              contest.phase === "BEFORE"
                ? "Upcoming"
                : contest.phase === "CODING"
                  ? "Running"
                  : "Finished",
          }));
        setContests(formattedContests);
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
      // Fallback to mock data
      setContests([
        {
          id: "1234",
          name: "Codeforces Round #789 (Div. 2)",
          startTime: "2023-10-15 17:35",
          duration: "2:00",
          status: "Finished",
        },
        {
          id: "1235",
          name: "Codeforces Round #790 (Div. 1)",
          startTime: "2023-10-20 19:35",
          duration: "2:15",
          status: "Finished",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Sort contests based on current sort field and direction
  const sortedContests = [...contests].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortDirection === "asc"
        ? new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        : new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    }
  });

  // Get current contests for pagination
  const indexOfLastContest = currentPage * contestsPerPage;
  const indexOfFirstContest = indexOfLastContest - contestsPerPage;
  const currentContests = sortedContests.slice(
    indexOfFirstContest,
    indexOfLastContest,
  );
  const totalPages = Math.ceil(contests.length / contestsPerPage);

  // Handle sort toggle
  const handleSort = (field: "name" | "startTime") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Running":
        return "text-green-600";
      case "Upcoming":
        return "text-blue-600";
      case "Finished":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <View className="bg-white p-4 rounded-md shadow-sm">
        <Text className="text-lg font-bold text-center">
          Loading contests...
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-md shadow-sm w-full">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-[#4b7bab]">Contest List</Text>
        <Text className="text-gray-600 mt-1">
          Browse available contests and check solutions
        </Text>
      </View>

      <ScrollView horizontal className="w-full">
        <View className="min-w-full">
          {/* Table Header */}
          <View className="flex-row bg-[#e1ecf4] p-3">
            <TouchableOpacity
              className="flex-row items-center flex-1"
              onPress={() => handleSort("name")}
            >
              <Text className="font-bold text-[#4b7bab]">Contest Name</Text>
              {sortField === "name" &&
                (sortDirection === "asc" ? (
                  <ChevronUp size={16} color="#4b7bab" />
                ) : (
                  <ChevronDown size={16} color="#4b7bab" />
                ))}
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center w-32"
              onPress={() => handleSort("startTime")}
            >
              <Text className="font-bold text-[#4b7bab]">Start Time</Text>
              {sortField === "startTime" &&
                (sortDirection === "asc" ? (
                  <ChevronUp size={16} color="#4b7bab" />
                ) : (
                  <ChevronDown size={16} color="#4b7bab" />
                ))}
            </TouchableOpacity>

            <View className="w-24">
              <Text className="font-bold text-[#4b7bab]">Duration</Text>
            </View>

            <View className="w-24">
              <Text className="font-bold text-[#4b7bab]">Status</Text>
            </View>

            <View className="w-24">
              <Text className="font-bold text-[#4b7bab]">Action</Text>
            </View>
          </View>

          {/* Table Body */}
          {currentContests.length > 0 ? (
            currentContests.map((contest, index) => (
              <View
                key={contest.id}
                className={`flex-row p-3 items-center ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-200`}
              >
                <View className="flex-1">
                  <Text className="text-[#4b7bab] font-medium">
                    {contest.name}
                  </Text>
                </View>

                <View className="w-32 flex-row items-center">
                  <Calendar size={14} className="mr-1" color="#666" />
                  <Text className="text-gray-700 text-sm">
                    {contest.startTime}
                  </Text>
                </View>

                <View className="w-24 flex-row items-center">
                  <Clock size={14} className="mr-1" color="#666" />
                  <Text className="text-gray-700 text-sm">
                    {contest.duration}
                  </Text>
                </View>

                <View className="w-24">
                  <Text
                    className={`${getStatusColor(contest.status)} font-medium`}
                  >
                    {contest.status}
                  </Text>
                </View>

                <View className="w-24">
                  <Link href={`/contest/${contest.id}`} asChild>
                    <TouchableOpacity className="bg-[#4b7bab] py-1 px-3 rounded">
                      <Text className="text-white text-center text-sm">
                        View
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            ))
          ) : (
            <View className="p-4 border-b border-gray-200">
              <Text className="text-center text-gray-500">
                No contests available
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Pagination */}
      {totalPages > 1 && (
        <View className="flex-row justify-center items-center p-4 border-t border-gray-200">
          <TouchableOpacity
            className={`px-3 py-1 mx-1 rounded ${currentPage === 1 ? "bg-gray-100" : "bg-[#4b7bab]"}`}
            onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <Text
              className={`${currentPage === 1 ? "text-gray-400" : "text-white"}`}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <Text className="mx-2 text-gray-700">
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            className={`px-3 py-1 mx-1 rounded ${currentPage === totalPages ? "bg-gray-100" : "bg-[#4b7bab]"}`}
            onPress={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            <Text
              className={`${currentPage === totalPages ? "text-gray-400" : "text-white"}`}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
