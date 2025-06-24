/**
 * Explore Screen - Advanced Token Analytics
 * Provides filtering, sorting, and advanced analytics for tokens
 */

import { TokenListItem } from "@/components/TokenListItem";
import { Colors } from "@/constants/Colors";
import { ColorScheme, useColorScheme } from "@/hooks/useColorScheme";
import { fetchBelieveTokens, formatNumber, Token } from "@/services/api";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SortOption = "mcap" | "volume" | "price" | "holders" | "age";
type FilterOption = "all" | "graduated" | "new" | "trending";

const Explore: React.FC = () => {
  const colorScheme: ColorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("mcap");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  useEffect(() => {
    loadTokens();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tokens, sortBy, filterBy]);

  const loadTokens = async () => {
    try {
      const response = await fetchBelieveTokens();
      setTokens(response.tokens || []);
    } catch (error) {
      console.error("Error loading tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tokens];

    // Apply filters
    switch (filterBy) {
      case "graduated":
        filtered = filtered.filter((token) => token.graduatedPool);
        break;
      case "new":
        // Tokens created in last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (token) => new Date(token.firstPool.createdAt) > oneDayAgo
        );
        break;
      case "trending":
        // Tokens with high volume relative to market cap
        filtered = filtered.filter(
          (token) => (token.volume24h || 0) > token.mcap * 0.1
        );
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "mcap":
          return b.mcap - a.mcap;
        case "volume":
          return (b.volume24h || 0) - (a.volume24h || 0);
        case "price":
          return b.usdPrice - a.usdPrice;
        case "holders":
          return b.holderCount - a.holderCount;
        case "age":
          return (
            new Date(b.firstPool.createdAt).getTime() -
            new Date(a.firstPool.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredTokens(filtered);
  };

  const renderFilterButton = (option: FilterOption, label: string) => (
    <TouchableOpacity
      key={option}
      style={[
        styles.filterButton,
        {
          backgroundColor:
            filterBy === option ? colors.primary : colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => setFilterBy(option)}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: filterBy === option ? colors.background : colors.text,
            fontWeight: filterBy === option ? "600" : "500",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSortButton = (option: SortOption, label: string) => (
    <TouchableOpacity
      key={option}
      style={[
        styles.sortButton,
        {
          backgroundColor: sortBy === option ? colors.primary : colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => setSortBy(option)}
    >
      <Text
        style={[
          styles.sortButtonText,
          {
            color: sortBy === option ? colors.background : colors.text,
            fontWeight: sortBy === option ? "600" : "500",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>Explore Tokens</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {formatNumber(filteredTokens.length)} tokens found
      </Text>

      {/* Filter Options */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Filter
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {renderFilterButton("all", "All")}
          {renderFilterButton("graduated", "Graduated")}
          {renderFilterButton("new", "New (24h)")}
          {renderFilterButton("trending", "Trending")}
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Sort by
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortContainer}
        >
          {renderSortButton("mcap", "Market Cap")}
          {renderSortButton("volume", "Volume")}
          {renderSortButton("price", "Price")}
          {renderSortButton("holders", "Holders")}
          {renderSortButton("age", "Newest")}
        </ScrollView>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading tokens...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={filteredTokens}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TokenListItem token={item} />}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: "row",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
  },
  sortContainer: {
    flexDirection: "row",
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 100,
  },
});

export default Explore;
