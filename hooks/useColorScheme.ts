/**
 * useColorScheme Hook
 * Provides color scheme detection for the app
 */

import { useColorScheme as useNativeColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

export function useColorScheme(): ColorScheme {
  const colorScheme = useNativeColorScheme();

  // Default to dark theme as per the monochrome design
  return colorScheme === "light" ? "light" : "dark";
}
