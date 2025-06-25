/**
 * TimeFrameSelector Component
 * Compact time frame selector with color-coded buttons
 */

import { Colors } from "@/constants/Colors";
import { ColorScheme, useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TimeFrameOption {
  value: TimeFrame;
  label: string;
  color: string;
}

interface TimeFrameSelectorProps {
  selectedTimeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
}

const TIME_FRAMES: TimeFrameOption[] = [
  { value: "5m", label: "5M", color: "#EF4444" },
  { value: "1h", label: "1H", color: "#F59E0B" },
  { value: "6h", label: "6H", color: "#8B5CF6" },
  { value: "24h", label: "24H", color: "#00D26B" },
];

export const TimeFrameSelector: React.FC<TimeFrameSelectorProps> = ({
  selectedTimeFrame,
  onTimeFrameChange,
}) => {
  const colorScheme: ColorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handlePress = (timeFrame: TimeFrame) => {
    onTimeFrameChange(timeFrame);
  };

  const renderTimeFrameButton = (frame: TimeFrameOption) => {
    const isSelected = selectedTimeFrame === frame.value;

    return (
      <TouchableOpacity
        key={frame.value}
        style={[
          styles.timeFrameButton,
          {
            backgroundColor: isSelected ? frame.color : colors.surface,
            borderColor: isSelected ? frame.color : colors.border,
            shadowColor: isSelected ? frame.color : "transparent",
          },
        ]}
        onPress={() => handlePress(frame.value)}
      >
        <Text
          style={[
            styles.timeFrameText,
            {
              color: isSelected ? "white" : colors.text,
              fontWeight: isSelected ? "700" : "500",
            },
          ]}
        >
          {frame.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.buttonRow}>
      {TIME_FRAMES.map(renderTimeFrameButton)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1.5,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeFrameText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
