import { Colors } from "@/constants/Colors";
import { ColorScheme, useColorScheme } from "@/hooks/useColorScheme";
import {
  formatAddress,
  formatCurrencyMillions,
  formatNumber,
  getTimeAgo,
} from "@/services/api";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TokenDetailStatsProps {
  token: Token;
}

export const TokenDetailStats: React.FC<TokenDetailStatsProps> = ({
  token,
}) => {
  const colorScheme: ColorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.statsSection}>
      {/* Market Stats */}
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

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Token Info */}
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

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Trading Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Traders (24h)
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatNumber(token.baseAsset.stats24h.numTraders)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Buys (24h)
          </Text>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {formatNumber(token.baseAsset.stats24h.numBuys)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Sells (24h)
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

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Contract Info */}
      <View style={styles.contractInfo}>
        <View style={styles.contractRow}>
          <Text style={[styles.contractLabel, { color: colors.textMuted }]}>
            Contract Address
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
  );
};

const styles = StyleSheet.create({
  statsSection: {
    marginBottom: 40,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  statItem: {
    width: "50%",
    marginBottom: 20,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginBottom: 20,
    opacity: 0.3,
  },
  contractInfo: {
    gap: 16,
  },
  contractRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contractLabel: {
    fontSize: 14,
    color: "#71717A",
  },
  contractValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});
