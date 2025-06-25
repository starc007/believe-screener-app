/**
 * Token Detail Screen
 * Displays comprehensive token information with price chart and analytics
 */

import { Colors } from "@/constants/Colors";
import { ColorScheme, useColorScheme } from "@/hooks/useColorScheme";
import {
  ChartData,
  ChartInterval,
  fetchTokenChart,
  fetchTokenDetail,
  formatAddress,
  formatCurrencyMillions,
  formatNumber,
  formatPercentage,
  getTimeAgo,
} from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-wagmi-charts";

const { width: screenWidth } = Dimensions.get("window");

const TokenDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme: ColorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // State
  const [token, setToken] = useState<Token | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [selectedInterval, setSelectedInterval] =
    useState<ChartInterval>("4_HOUR");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);

  useEffect(() => {
    if (id) {
      loadTokenData();
    }
  }, [id]);

  useEffect(() => {
    // Entry animations
    headerOpacity.value = withTiming(1, { duration: 800 });
    contentTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  const loadTokenData = async () => {
    if (!id) return;

    try {
      const [tokenData, chartDataResponse] = await Promise.all([
        fetchTokenDetail(id),
        fetchTokenChart(id, selectedInterval),
      ]);

      setToken(tokenData);
      setChartData(chartDataResponse);
    } catch (error) {
      console.error("Error loading token data:", error);
      Alert.alert("Error", "Failed to load token data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async (interval: ChartInterval) => {
    if (!id) return;

    setChartLoading(true);
    try {
      const data = await fetchTokenChart(id, interval);
      setChartData(data);
      setSelectedInterval(interval);
    } catch (error) {
      console.error("Error loading chart data:", error);
      Alert.alert("Error", "Failed to load chart data. Please try again.");
    } finally {
      setChartLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTokenData();
    setRefreshing(false);
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Loading token details...
            </Text>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  if (!token) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>
              Token not found
            </Text>
            <Pressable
              style={[styles.backButton, { backgroundColor: colors.primary }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.backButtonText, { color: colors.white }]}>
                Go Back
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  const renderHeader = () => {
    const priceChange24h = formatPercentage(
      token.baseAsset.stats24h.priceChange
    );

    return (
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        {/* Back Button */}
        <Pressable
          style={[styles.backIcon, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backIconText, { color: colors.text }]}>←</Text>
        </Pressable>

        {/* Token Header */}
        <View style={styles.tokenHeader}>
          <View style={styles.tokenBasicInfo}>
            {token.baseAsset.icon ? (
              <Image
                source={{ uri: token.baseAsset.icon }}
                style={styles.tokenIcon}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.placeholderIcon,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Text
                  style={[styles.placeholderText, { color: colors.primary }]}
                >
                  {token.baseAsset.symbol.charAt(0)}
                </Text>
              </View>
            )}

            <View style={styles.tokenInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.tokenName, { color: colors.text }]}>
                  {token.baseAsset.name}
                </Text>
                {token.baseAsset.isVerified && (
                  <View
                    style={[
                      styles.verifiedBadge,
                      { backgroundColor: colors.success },
                    ]}
                  >
                    <Text style={styles.verifiedText}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tokenSymbol, { color: colors.textMuted }]}>
                {token.baseAsset.symbol}
              </Text>
            </View>
          </View>

          <View style={styles.priceInfo}>
            <Text style={[styles.price, { color: colors.text }]}>
              {formatCurrencyMillions(token.baseAsset.usdPrice)}
            </Text>
            <Text
              style={[
                styles.priceChange,
                {
                  color: priceChange24h.isPositive
                    ? colors.success
                    : colors.error,
                },
              ]}
            >
              {priceChange24h.text}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderChart = () => {
    if (!chartData || chartData.candles.length === 0) {
      return (
        <View
          style={[styles.chartContainer, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.noChartText, { color: colors.textMuted }]}>
            No chart data available
          </Text>
        </View>
      );
    }

    // Convert chart data to the format expected by wagmi-charts
    const chartPoints = chartData.candles.map((candle) => ({
      timestamp: candle.time * 1000, // Convert to milliseconds
      value: candle.close,
    }));

    const intervals: { key: ChartInterval; label: string }[] = [
      { key: "1_HOUR", label: "1H" },
      { key: "4_HOUR", label: "4H" },
      { key: "12_HOUR", label: "12H" },
    ];

    return (
      <View
        style={[styles.chartContainer, { backgroundColor: colors.surface }]}
      >
        {/* Chart Header */}
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            Price Chart
          </Text>
          <View style={styles.intervalSelector}>
            {intervals.map((interval) => (
              <Pressable
                key={interval.key}
                style={[
                  styles.intervalButton,
                  selectedInterval === interval.key && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => loadChartData(interval.key)}
                disabled={chartLoading}
              >
                <Text
                  style={[
                    styles.intervalText,
                    {
                      color:
                        selectedInterval === interval.key
                          ? colors.white
                          : colors.textMuted,
                    },
                  ]}
                >
                  {interval.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Chart */}
        {chartLoading ? (
          <View style={styles.chartLoadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.chart}>
            <LineChart.Provider data={chartPoints}>
              <LineChart height={200} width={screenWidth - 40}>
                <LineChart.Path color={colors.primary} />
                <LineChart.CursorCrosshair color={colors.primary} />
              </LineChart>
            </LineChart.Provider>
          </View>
        )}
      </View>
    );
  };

  const renderStats = () => {
    return (
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Statistics
        </Text>

        {/* Market Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsCardTitle, { color: colors.text }]}>
            Market Data
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Market Cap
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatCurrencyMillions(token.baseAsset.mcap)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                FDV
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatCurrencyMillions(token.baseAsset.fdv)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Volume 24h
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatCurrencyMillions(token.volume24h)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Liquidity
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatCurrencyMillions(token.liquidity)}
              </Text>
            </View>
          </View>
        </View>

        {/* Token Info */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsCardTitle, { color: colors.text }]}>
            Token Info
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Holders
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatNumber(token.baseAsset.holderCount)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Supply
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatNumber(token.baseAsset.circSupply)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Organic Score
              </Text>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {token.baseAsset.organicScore.toFixed(0)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Created
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {getTimeAgo(token.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Trading Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsCardTitle, { color: colors.text }]}>
            24h Trading
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Traders
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatNumber(token.baseAsset.stats24h.numTraders)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Buys
              </Text>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {formatNumber(token.baseAsset.stats24h.numBuys)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Sells
              </Text>
              <Text style={[styles.statValue, { color: colors.error }]}>
                {formatNumber(token.baseAsset.stats24h.numSells)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Net Buyers
              </Text>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {formatNumber(token.baseAsset.stats24h.numNetBuyers)}
              </Text>
            </View>
          </View>
        </View>

        {/* Contract Info */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsCardTitle, { color: colors.text }]}>
            Contract
          </Text>
          <View style={styles.contractInfo}>
            <View style={styles.contractRow}>
              <Text style={[styles.contractLabel, { color: colors.textMuted }]}>
                Address
              </Text>
              <Text style={[styles.contractValue, { color: colors.text }]}>
                {formatAddress(token.baseAsset.id)}
              </Text>
            </View>
            <View style={styles.contractRow}>
              <Text style={[styles.contractLabel, { color: colors.textMuted }]}>
                DEX
              </Text>
              <Text style={[styles.contractValue, { color: colors.text }]}>
                {token.dex}
              </Text>
            </View>
            <View style={styles.contractRow}>
              <Text style={[styles.contractLabel, { color: colors.textMuted }]}>
                Launchpad
              </Text>
              <Text style={[styles.contractValue, { color: colors.primary }]}>
                {token.baseAsset.launchpad}
              </Text>
            </View>
          </View>
        </View>

        {/* Tags */}
        {token.baseAsset.tags && token.baseAsset.tags.length > 0 && (
          <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statsCardTitle, { color: colors.text }]}>
              Tags
            </Text>
            <View style={styles.tagsContainer}>
              {token.baseAsset.tags.map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Text style={[styles.tagText, { color: colors.primary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* CEX Listings */}
        {token.baseAsset.cexes && token.baseAsset.cexes.length > 0 && (
          <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statsCardTitle, { color: colors.text }]}>
              CEX Listings
            </Text>
            <View style={styles.cexContainer}>
              {token.baseAsset.cexes.map((cex, index) => (
                <View
                  key={index}
                  style={[
                    styles.cexBadge,
                    { backgroundColor: colors.success + "20" },
                  ]}
                >
                  <Text style={[styles.cexText, { color: colors.success }]}>
                    {cex}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            {renderChart()}
            {renderStats()}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
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
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  backIconText: {
    fontSize: 20,
    fontWeight: "600",
  },
  tokenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tokenBasicInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tokenIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  placeholderIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  tokenInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  tokenName: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 8,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  tokenSymbol: {
    fontSize: 16,
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  priceChange: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
  },
  chartContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  intervalSelector: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
  },
  intervalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  intervalText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chart: {
    height: 200,
  },
  chartLoadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  noChartText: {
    textAlign: "center",
    fontSize: 16,
    paddingVertical: 60,
  },
  statsSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statsCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statItem: {
    width: "50%",
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  contractInfo: {
    gap: 12,
  },
  contractRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contractLabel: {
    fontSize: 14,
  },
  contractValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cexContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cexBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cexText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default TokenDetailScreen;
