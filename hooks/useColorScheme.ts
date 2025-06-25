/**
 * useColorScheme Hook
 * Provides color scheme detection for the app
 */

import { useColorScheme as useNativeColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

export function useColorScheme(): ColorScheme {
  const colorScheme = useNativeColorScheme();
  // implement later

  // Default to dark theme as per the monochrome design
  return "dark";
}
