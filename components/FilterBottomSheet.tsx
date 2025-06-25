import React from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { DropdownOption } from "@/components/FilterDropdown";
import { TimeFrame, TimeFrameSelector } from "@/components/TimeFrameSelector";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { ColorScheme, useColorScheme } from "@/hooks/useColorScheme";

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedTimeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  filterOptions: DropdownOption[];
  sortOptions: DropdownOption[];
  resultCount: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

interface OptionItemProps {
  option: DropdownOption;
  isSelected: boolean;
  onSelect: (value: string) => void;
  colors: any;
}

function OptionItem({ option, isSelected, onSelect, colors }: OptionItemProps) {
  return (
    <Pressable
      onPress={() => onSelect(option.value)}
      style={[
        styles.optionItem,
        {
          backgroundColor: isSelected ? colors.primary : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
    >
      <Text style={styles.optionIcon}>{option.icon}</Text>
      <Text
        style={[
          styles.optionLabel,
          {
            color: isSelected ? colors.background : colors.text,
            fontWeight: isSelected ? "600" : "500",
          },
        ]}
      >
        {option.label}
      </Text>
    </Pressable>
  );
}

export function FilterBottomSheet({
  visible,
  onClose,
  selectedTimeFrame,
  onTimeFrameChange,
  selectedFilter,
  onFilterChange,
  selectedSort,
  onSortChange,
  filterOptions,
  sortOptions,
  resultCount,
}: FilterBottomSheetProps) {
  const colorScheme: ColorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(300, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      });
    }
  }, [visible]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.backdrop,
            { backgroundColor: "rgba(0,0,0,0.5)" },
            backdropAnimatedStyle,
          ]}
        >
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>

        <AnimatedView
          style={[
            styles.sheet,
            { backgroundColor: colors.background },
            sheetAnimatedStyle,
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                Filter & Sort
              </Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <IconSymbol name="xmark" size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Time Frame */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Time Frame
                </Text>
                <TimeFrameSelector
                  selectedTimeFrame={selectedTimeFrame}
                  onTimeFrameChange={onTimeFrameChange}
                />
              </View>

              {/* Category Filters */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Category
                </Text>
                <View style={styles.optionsGrid}>
                  {filterOptions.map((option) => (
                    <OptionItem
                      key={option.value}
                      option={option}
                      isSelected={selectedFilter === option.value}
                      onSelect={onFilterChange}
                      colors={colors}
                    />
                  ))}
                </View>
              </View>

              {/* Sort Options */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Sort By
                </Text>
                <View style={styles.optionsGrid}>
                  {sortOptions.map((option) => (
                    <OptionItem
                      key={option.value}
                      option={option}
                      isSelected={selectedSort === option.value}
                      onSelect={onSortChange}
                      colors={colors}
                    />
                  ))}
                </View>
              </View>

              {/* Result Count */}
              <View style={styles.resultSection}>
                <Text style={[styles.resultCount, { color: colors.textMuted }]}>
                  {resultCount} tokens found
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </AnimatedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    minHeight: 400,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 4,
  },
  optionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  optionLabel: {
    fontSize: 14,
  },
  resultSection: {
    marginTop: 32,
    marginBottom: 24,
    alignItems: "center",
  },
  resultCount: {
    fontSize: 16,
    fontWeight: "500",
  },
});
