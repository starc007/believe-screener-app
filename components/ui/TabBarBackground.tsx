import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";

// Blur effect for tab bar background (works on web, Android, and iOS)
export default function BlurTabBarBackground() {
  return (
    <BlurView
      tint="dark"
      intensity={100}
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: "transparent",
        },
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
