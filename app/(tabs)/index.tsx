import { StatsCard } from "@/components/StatsCard";
import { TokenListItem } from "@/components/TokenListItem";
import { Colors } from "@/constants/Colors";
import { ColorScheme, useColorScheme } from "@/hooks/useColorScheme";
import {
  fetchBelieveTokens,
  fetchLaunchpadStats,
  formatCurrencyMillions,
  formatNumber,
  LaunchpadStats,
} from "@/services/api";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home: React.FC = () => {
  const colorScheme: ColorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  // State management
  const [stats, setStats] = useState<LaunchpadStats | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Loads data from APIs
   */
  const loadData = async () => {
    try {
      const [statsResponse, tokensResponse] = await Promise.all([
        fetchLaunchpadStats(),
        fetchBelieveTokens("1h"),
      ]);

      // Find Believe stats
      const believeStats = statsResponse.launchpads.find(
        (launchpad) => launchpad.launchpad === "Believe"
      );

      setStats(believeStats || null);
      setTokens(tokensResponse.tokens || []);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  /**
   * Handles token item press
   */
  const handleTokenPress = (token: Token) => {
    router.push(`/token/${token.baseAsset.id}`);
  };

  /**
   * Renders the stats header section
   */
  const renderStatsHeader = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Believe Screener
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
          Real-time launchpad analytics
        </Text>

        {/* Stats Row 1 */}
        <View style={styles.statsRow}>
          <StatsCard
            title="24h Volume"
            value={formatCurrencyMillions(stats.stats24h.volume)}
            subtitle=""
            accentColor={colors.success}
          />
          <StatsCard
            title="24h Traders"
            value={formatNumber(stats.stats24h.traders)}
            subtitle=""
            accentColor={colors.accent}
          />
        </View>

        {/* Stats Row 2 */}
        <View style={styles.statsRow}>
          <StatsCard
            title="Total Liquidity"
            value={formatCurrencyMillions(stats.liquidity)}
            subtitle=""
            accentColor={colors.accentPurple}
          />
          <StatsCard
            title="Bonded / Mints"
            value={`${stats.stats24h.graduates} / ${stats.stats24h.mints}`}
            subtitle=""
            accentColor={colors.warning}
          />
        </View>
      </View>
    );
  };

  /**
   * Renders loading state
   */
  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading Believe data...
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
        data={tokens}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TokenListItem
            token={item}
            onPress={handleTokenPress}
            index={index}
          />
        )}
        ListHeaderComponent={
          <View>
            {renderStatsHeader()}
            <Text style={[styles.tokensTitle, { color: colors.text }]}>
              Top Tokens
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
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
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 12,
    marginHorizontal: -6,
  },
  tokensTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
});

export default Home;
