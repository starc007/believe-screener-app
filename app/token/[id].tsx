import {
  TokenDetailChart,
  TokenDetailHeader,
  TokenDetailStats,
} from "@/components/TokenDetail";
import { Colors } from "@/constants/Colors";
import { ColorScheme, useColorScheme } from "@/hooks/useColorScheme";
import {
  ChartData,
  ChartInterval,
  fetchTokenChart,
  fetchTokenDetail,
} from "@/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  const contentTranslateY = useSharedValue(30);

  useEffect(() => {
    if (id) {
      loadTokenData();
    }
  }, [id]);

  useEffect(() => {
    // Entry animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    contentTranslateY.value = withSpring(0, { damping: 15, stiffness: 120 });
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
          <TokenDetailHeader
            token={token}
            headerAnimatedStyle={headerAnimatedStyle}
          />
          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            <TokenDetailChart
              chartData={chartData}
              selectedInterval={selectedInterval}
              chartLoading={chartLoading}
              onIntervalChange={loadChartData}
            />
            <TokenDetailStats token={token} />
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
  content: {
    paddingHorizontal: 20,
  },
});

export default TokenDetailScreen;
