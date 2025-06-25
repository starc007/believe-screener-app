/**
 * TokenListItem Component
 * Beautiful animated token list item with smooth interactions
 */

import { Colors } from "@/constants/Colors";
import { ColorScheme, useColorScheme } from "@/hooks/useColorScheme";
import {
  Token,
  formatCurrencyMillions,
  formatNumber,
  formatPercentage,
} from "@/services/api";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface TokenListItemProps {
  token: Token;
  onPress?: (token: Token) => void;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const TokenListItem: React.FC<TokenListItemProps> = ({
  token,
  onPress,
  index = 0,
}) => {
  const colorScheme: ColorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  // Entry animation
  React.useEffect(() => {
    const delay = index * 100; // Stagger animation based on index
    opacity.value = withTiming(1, { duration: 600 }, () => {
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    });
  }, []);

  // Press handlers
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    onPress?.(token);
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const shimmer = interpolate(
      Math.sin(Date.now() / 1000),
      [-1, 1],
      [0.8, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity: shimmer,
    };
  });

  // Format price changes
  const priceChange24h = formatPercentage(
    token.baseAsset?.stats24h?.priceChange || 0
  );
  const priceChange1h = formatPercentage(
    token.baseAsset?.stats1h?.priceChange || 0
  );

  // Calculate trending indicator
  const isHotToken = (token.baseAsset?.stats24h?.numTraders || 0) > 100;
  const isNewToken =
    new Date(token.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);

  return (
    <AnimatedPressable
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.primary,
        },
        containerAnimatedStyle,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      {/* Gradient Background Overlay */}
      <View
        style={[
          styles.gradientOverlay,
          { backgroundColor: colors.primary + "05" },
        ]}
      />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.tokenInfo}>
          {/* Token Icon with Animated Border */}
          <Animated.View style={[styles.iconContainer, shimmerAnimatedStyle]}>
            {token.baseAsset?.icon ? (
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
                  {token.baseAsset?.symbol?.charAt(0) || "?"}
                </Text>
              </View>
            )}
            {isHotToken && (
              <View
                style={[styles.hotBadge, { backgroundColor: colors.error }]}
              >
                <Text style={styles.hotBadgeText}>🔥</Text>
              </View>
            )}
            {isNewToken && (
              <View
                style={[styles.newBadge, { backgroundColor: colors.success }]}
              >
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </Animated.View>

          {/* Token Details */}
          <View style={styles.tokenDetails}>
            <View style={styles.nameRow}>
              <Text
                style={[styles.tokenName, { color: colors.text }]}
                numberOfLines={1}
              >
                {token.baseAsset?.name || "Unknown Token"}
              </Text>
              <View
                style={[
                  styles.symbolChip,
                  { backgroundColor: colors.primary + "15" },
                ]}
              >
                <Text style={[styles.tokenSymbol, { color: colors.primary }]}>
                  {token.baseAsset?.symbol || "UNK"}
                </Text>
              </View>
            </View>

            <View style={styles.subInfo}>
              <Text style={[styles.dexLabel, { color: colors.textMuted }]}>
                {token.dex} • {formatNumber(token.baseAsset?.holderCount || 0)}{" "}
                holders
              </Text>
            </View>
          </View>
        </View>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={[styles.price, { color: colors.text }]}>
            {formatCurrencyMillions(token.baseAsset?.usdPrice || 0)}
          </Text>
          <Text style={[styles.marketCap, { color: colors.textMuted }]}>
            MCap: {formatCurrencyMillions(token.baseAsset?.mcap || 0)}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Volume */}
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            24h Vol
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatCurrencyMillions(token.volume24h || 0)}
          </Text>
        </View>

        {/* Liquidity */}
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Liquidity
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatCurrencyMillions(token.liquidity || 0)}
          </Text>
        </View>

        {/* Traders */}
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Traders
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatNumber(token.baseAsset?.stats24h?.numTraders || 0)}
          </Text>
        </View>

        {/* Buys/Sells Ratio */}
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            B/S Ratio
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {(
              (token.baseAsset?.stats24h?.numBuys || 0) /
              Math.max(token.baseAsset?.stats24h?.numSells || 1, 1)
            ).toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Price Changes */}
      <View style={styles.changesRow}>
        <View style={styles.changeItem}>
          <Text style={[styles.changeLabel, { color: colors.textMuted }]}>
            1h
          </Text>
          <Animated.View
            style={[
              styles.changeBadge,
              {
                backgroundColor: priceChange1h.isPositive
                  ? colors.success + "20"
                  : colors.error + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.changeValue,
                {
                  color: priceChange1h.isPositive
                    ? colors.success
                    : colors.error,
                },
              ]}
            >
              {priceChange1h.text}
            </Text>
          </Animated.View>
        </View>

        <View style={styles.changeItem}>
          <Text style={[styles.changeLabel, { color: colors.textMuted }]}>
            24h
          </Text>
          <Animated.View
            style={[
              styles.changeBadge,
              {
                backgroundColor: priceChange24h.isPositive
                  ? colors.success + "20"
                  : colors.error + "20",
              },
            ]}
          >
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
          </Animated.View>
        </View>

        {/* Organic Score Indicator */}
        <View style={styles.organicScore}>
          <Text style={[styles.organicLabel, { color: colors.textMuted }]}>
            Score
          </Text>
          <View
            style={[
              styles.scoreBadge,
              {
                backgroundColor:
                  (token.baseAsset?.organicScore || 0) > 70
                    ? colors.success + "20"
                    : (token.baseAsset?.organicScore || 0) > 40
                    ? colors.warning + "20"
                    : colors.error + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.scoreText,
                {
                  color:
                    (token.baseAsset?.organicScore || 0) > 70
                      ? colors.success
                      : (token.baseAsset?.organicScore || 0) > 40
                      ? colors.warning
                      : colors.error,
                },
              ]}
            >
              {Math.round(token.baseAsset?.organicScore || 0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Bar for Volume */}
      <View
        style={[styles.progressContainer, { backgroundColor: colors.border }]}
      >
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.primary,
              width: `${Math.min(
                ((token.volume24h || 0) / 1000000) * 100,
                100
              )}%`,
            },
          ]}
        />
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  tokenInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    position: "relative",
    marginRight: 12,
  },
  tokenIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  placeholderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "700",
  },
  hotBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  hotBadgeText: {
    fontSize: 8,
  },
  newBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: "white",
  },
  tokenDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
    flex: 1,
  },
  symbolChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tokenSymbol: {
    fontSize: 12,
    fontWeight: "600",
  },
  subInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  dexLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  priceSection: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
  },
  marketCap: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  changesRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: "space-between",
    alignItems: "center",
  },
  changeItem: {
    alignItems: "center",
  },
  changeLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 4,
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  organicScore: {
    alignItems: "center",
  },
  organicLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 4,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressContainer: {
    height: 3,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 2,
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
});
