import { Colors } from "@/constants/Colors";
import { ColorScheme, useColorScheme } from "@/hooks/useColorScheme";
import { formatCurrencyMillions, formatPercentage } from "@/services/api";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

interface TokenDetailHeaderProps {
  token: Token;
  headerAnimatedStyle: any;
}

export const TokenDetailHeader: React.FC<TokenDetailHeaderProps> = ({
  token,
  headerAnimatedStyle,
}) => {
  const router = useRouter();
  const colorScheme: ColorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const priceChange24h = formatPercentage(token.baseAsset.stats24h.priceChange);

  return (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      {/* Top Row - Back Button, Token Image, Token Name */}
      <View style={styles.topRow}>
        <Pressable style={styles.backIcon} onPress={() => router.back()}>
          <Text style={[styles.backIconText, { color: colors.text }]}>←</Text>
        </Pressable>

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
            <Text style={[styles.placeholderText, { color: colors.primary }]}>
              {token.baseAsset.symbol.charAt(0)}
            </Text>
          </View>
        )}

        <View style={styles.tokenHeaderInfo}>
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
            {token.baseAsset.symbol} • {token.dex}
          </Text>
        </View>
      </View>

      {/* Price Info */}
      <View style={styles.priceSection}>
        <Text style={[styles.price, { color: colors.text }]}>
          {formatCurrencyMillions(token.baseAsset.usdPrice)}
        </Text>
        <Text
          style={[
            styles.priceChange,
            {
              color: priceChange24h.isPositive ? colors.success : colors.error,
            },
          ]}
        >
          {priceChange24h.text} 24h
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backIcon: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: `${Colors.dark.white}20`,
    borderRadius: 999,
  },
  backIconText: {
    fontSize: 20,
    fontWeight: "600",
  },
  tokenIcon: {
    width: 36,
    height: 36,
    borderRadius: 24,
    marginRight: 10,
  },
  placeholderIcon: {
    width: 36,
    height: 36,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  tokenHeaderInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 4,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  tokenSymbol: {
    fontSize: 12,
  },
  priceSection: {
    alignItems: "flex-start",
  },
  price: {
    fontSize: 35,
    fontWeight: "bold",
    marginBottom: 8,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: "600",
  },
});
