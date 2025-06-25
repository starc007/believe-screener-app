import { Colors } from "@/constants/Colors";
import { ColorScheme, useColorScheme } from "@/hooks/useColorScheme";
import { ChartData, ChartInterval } from "@/services/api";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-wagmi-charts";

const { width: screenWidth } = Dimensions.get("window");

interface TokenDetailChartProps {
  chartData: ChartData | null;
  selectedInterval: ChartInterval;
  chartLoading: boolean;
  onIntervalChange: (interval: ChartInterval) => void;
}

export const TokenDetailChart: React.FC<TokenDetailChartProps> = ({
  chartData,
  selectedInterval,
  chartLoading,
  onIntervalChange,
}) => {
  const colorScheme: ColorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  if (!chartData || chartData.candles.length === 0) {
    return (
      <View style={styles.chartContainer}>
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
    <View style={styles.chartContainer}>
      {/* Chart Header */}
      <View style={styles.chartHeader}>
        <View style={styles.intervalSelector}>
          {intervals.map((interval) => (
            <Pressable
              key={interval.key}
              style={[
                styles.intervalButton,
                selectedInterval === interval.key && {
                  backgroundColor: colors.primary,
                },
                { borderColor: colors.border },
              ]}
              onPress={() => onIntervalChange(interval.key)}
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
            <LineChart height={220} width={screenWidth - 40}>
              <LineChart.Path color={colors.primary} />
              <LineChart.CursorCrosshair color={colors.primary} />
            </LineChart>
          </LineChart.Provider>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginBottom: 30,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  intervalSelector: {
    flexDirection: "row",
    borderRadius: 8,
  },
  intervalButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    marginLeft: 8,
    borderRadius: 10,
  },
  intervalText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chart: {
    height: 220,
  },
  chartLoadingContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  noChartText: {
    textAlign: "center",
    fontSize: 16,
    paddingVertical: 60,
  },
});
