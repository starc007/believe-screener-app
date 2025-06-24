import { Colors } from "@/constants/Colors";
import { ColorScheme, useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  accentColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  accentColor,
}) => {
  const colorScheme: ColorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text
        style={[styles.title, { color: accentColor || colors.textSecondary }]}
        numberOfLines={2}
      >
        {title}
      </Text>
      <Text
        style={[styles.value, { color: colors.text }]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </Text>
      {subtitle && (
        <Text
          style={[styles.subtitle, { color: colors.textMuted }]}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 16,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 14,
  },
});
