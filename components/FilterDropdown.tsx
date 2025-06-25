import { Colors } from "@/constants/Colors";
import { ColorScheme, useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
  color?: string;
}

interface FilterDropdownProps {
  title: string;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  title,
  options,
  selectedValue,
  onSelect,
  placeholder = "Select option",
}) => {
  const colorScheme: ColorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const [isOpen, setIsOpen] = useState(false);
  const scale = useSharedValue(1);

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      setIsOpen(true);
    }, 100);
  };

  const handleOptionSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        {
          backgroundColor:
            selectedValue === item.value
              ? colors.primary + "15"
              : "transparent",
          borderColor: colors.border,
        },
      ]}
      onPress={() => handleOptionSelect(item.value)}
    >
      <View style={styles.optionContent}>
        {item.icon && <Text style={styles.optionIcon}>{item.icon}</Text>}
        <Text
          style={[
            styles.optionText,
            {
              color:
                selectedValue === item.value ? colors.primary : colors.text,
              fontWeight: selectedValue === item.value ? "600" : "500",
            },
          ]}
        >
          {item.label}
        </Text>
      </View>
      {selectedValue === item.value && (
        <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <AnimatedTouchable
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            animatedStyle,
          ]}
          onPress={handlePress}
        >
          <View style={styles.dropdownContent}>
            {selectedOption?.icon && (
              <Text style={styles.selectedIcon}>{selectedOption.icon}</Text>
            )}
            <Text
              style={[
                styles.selectedText,
                { color: selectedOption ? colors.text : colors.textMuted },
              ]}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </Text>
          </View>
          <Text style={[styles.arrow, { color: colors.textMuted }]}>
            {isOpen ? "▲" : "▼"}
          </Text>
        </AnimatedTouchable>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select {title}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={renderOption}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: "500",
  },
  arrow: {
    fontSize: 12,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 300,
    maxHeight: 400,
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
    borderWidth: 1,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "700",
  },
});
