/**
 * TokenListItem Component
 * Displays individual token information in a list format
 */

import { Colors } from "@/constants/Colors";
import { ColorScheme, useColorScheme } from "@/hooks/useColorScheme";
import {
  Token,
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "@/services/api";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TokenListItemProps {
  token: Token;
  onPress?: (token: Token) => void;
}

export const TokenListItem: React.FC<TokenListItemProps> = ({
  token,
  onPress,
}) => {
  const colorScheme: ColorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handlePress = () => {
    onPress?.(token);
  };

  // Format price change for display
  const priceChange24h = formatPercentage(token.priceChange24h || 0);
  const priceChange30m = formatPercentage(token.priceChange30m || 0);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Token Info */}
      <View style={styles.tokenInfo}>
        <View style={styles.tokenHeader}>
          {token.icon && (
            <Image source={{ uri: token.icon }} style={styles.tokenIcon} />
          )}
          <View style={styles.tokenDetails}>
            <Text
              style={[styles.tokenName, { color: colors.text }]}
              numberOfLines={1}
            >
              {token.name}
            </Text>
            <Text style={[styles.tokenSymbol, { color: colors.textMuted }]}>
              {token.symbol}
            </Text>
          </View>
        </View>

        {/* Price and Market Cap */}
        <View style={styles.priceSection}>
          <Text style={[styles.price, { color: colors.text }]}>
            {formatCurrency(token.usdPrice)}
          </Text>
          <Text style={[styles.marketCap, { color: colors.textMuted }]}>
            {formatNumber(token.mcap)}
          </Text>
        </View>
      </View>

      {/* Price Changes */}
      <View style={styles.changesSection}>
        <View style={styles.changeItem}>
          <Text style={[styles.changeLabel, { color: colors.textMuted }]}>
            30m
          </Text>
          <Text
            style={[
              styles.changeValue,
              {
                color: priceChange30m.isPositive
                  ? colors.success
                  : colors.error,
              },
            ]}
          >
            {priceChange30m.text}
          </Text>
        </View>
        <View style={styles.changeItem}>
          <Text style={[styles.changeLabel, { color: colors.textMuted }]}>
            24h
          </Text>
          <Text
            style={[
              styles.changeValue,
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

      {/* Volume and Liquidity */}
      <View style={styles.metricsSection}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            Volume
          </Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {formatNumber(token.volume24h || 0)}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            Liquidity
          </Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {formatNumber(token.liquidity || 0)}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            Holders
          </Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {formatNumber(token.holderCount)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
  },
  tokenInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tokenHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  tokenDetails: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  tokenSymbol: {
    fontSize: 14,
    fontWeight: "500",
  },
  priceSection: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  marketCap: {
    fontSize: 12,
    fontWeight: "500",
  },
  changesSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    paddingVertical: 8,
  },
  changeItem: {
    alignItems: "center",
  },
  changeLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  changeValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  metricsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "600",
  },
});
