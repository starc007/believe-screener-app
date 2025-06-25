/**
 * Explore Screen
 * Compact design with filter icon that opens bottom sheet
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { FilterBottomSheet } from "@/components/FilterBottomSheet";
import { DropdownOption } from "@/components/FilterDropdown";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TimeFrame } from "@/components/TimeFrameSelector";
import { TokenListItem } from "@/components/TokenListItem";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { ColorScheme, useColorScheme } from "@/hooks/useColorScheme";
import { fetchBelieveTokens, Token } from "@/services/api";

const AnimatedView = Animated.createAnimatedComponent(View);

// Filter options
const FILTER_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All Tokens", icon: "🌟" },
  { value: "hot", label: "Hot", icon: "🔥" },
  { value: "trending", label: "Trending", icon: "📈" },
  { value: "graduated", label: "Graduated", icon: "🎓" },
  { value: "new", label: "New (24h)", icon: "🆕" },
];

const SORT_OPTIONS: DropdownOption[] = [
  { value: "market_cap", label: "Market Cap", icon: "💰" },
  { value: "volume", label: "Volume", icon: "📊" },
  { value: "price", label: "Price", icon: "💵" },
  { value: "traders", label: "Traders", icon: "👥" },
  { value: "holders", label: "Holders", icon: "🤝" },
  { value: "newest", label: "Newest", icon: "⏰" },
];

export default function ExploreScreen() {
  const colorScheme: ColorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // State
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>("24h");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("market_cap");
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);

  // Load data
  const loadTokens = async (timeFrame: TimeFrame = selectedTimeFrame) => {
    try {
      setLoading(true);
      const tokensResponse = await fetchBelieveTokens(timeFrame);
      setTokens(tokensResponse.tokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTokens();
    setRefreshing(false);
  };

  // Handle time frame change
  const handleTimeFrameChange = (timeFrame: TimeFrame) => {
    setSelectedTimeFrame(timeFrame);
    loadTokens(timeFrame);
  };

  // Filter and sort tokens
  const filteredAndSortedTokens = useMemo(() => {
    let filtered = tokens.filter((token) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          token.baseAsset.symbol.toLowerCase().includes(query) ||
          token.baseAsset.name.toLowerCase().includes(query)
        );
      }
      return true;
    });

    // Category filter
    filtered = filtered.filter((token) => {
      switch (selectedFilter) {
        case "hot":
          return token.baseAsset.stats24h.numTraders >= 100;
        case "trending":
          return token.volume24h / token.baseAsset.mcap > 0.1;
        case "graduated":
          return token.baseAsset.mcap > 69000;
        case "new":
          return (
            Date.now() - new Date(token.createdAt).getTime() <
            24 * 60 * 60 * 1000
          );
        default:
          return true;
      }
    });

    // Sort
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case "volume":
          return b.volume24h - a.volume24h;
        case "price":
          return b.baseAsset.usdPrice - a.baseAsset.usdPrice;
        case "traders":
          return (
            b.baseAsset.stats24h.numTraders - a.baseAsset.stats24h.numTraders
          );
        case "holders":
          return b.baseAsset.holderCount - a.baseAsset.holderCount;
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default: // market_cap
          return b.baseAsset.mcap - a.baseAsset.mcap;
      }
    });

    return filtered;
  }, [tokens, searchQuery, selectedFilter, selectedSort]);

  // Initial load and animation
  useEffect(() => {
    loadTokens();

    // Animate header
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const renderTokenItem = ({ item, index }: { item: Token; index: number }) => (
    <TokenListItem token={item} index={index} />
  );

  if (loading && tokens.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <AnimatedView style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>
            Explore Tokens
          </Text>
          <Pressable
            onPress={() => setShowFilterSheet(true)}
            style={[
              styles.filterButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <IconSymbol
              name="line.horizontal.3.decrease.circle"
              size={20}
              color={colors.primary}
            />
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Search tokens..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Text style={[styles.resultCount, { color: colors.textMuted }]}>
            {filteredAndSortedTokens.length} found
          </Text>
        </View>
      </AnimatedView>

      <FlatList
        data={filteredAndSortedTokens}
        keyExtractor={(item) => item.baseAsset.id}
        renderItem={renderTokenItem}
        contentContainerStyle={styles.tokenList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {searchQuery
                ? "No tokens found matching your search"
                : "No tokens available"}
            </Text>
          </View>
        }
      />

      <FilterBottomSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        selectedTimeFrame={selectedTimeFrame}
        onTimeFrameChange={handleTimeFrameChange}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        filterOptions={FILTER_OPTIONS}
        sortOptions={SORT_OPTIONS}
        resultCount={filteredAndSortedTokens.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  filterButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  resultCount: {
    fontSize: 12,
    fontWeight: "500",
    minWidth: 60,
    textAlign: "right",
  },
  tokenList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
