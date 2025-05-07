import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { IFilterOption } from "~/lib/types/filters";

interface FilterDropdownProps {
  title?: string;
  options: IFilterOption[];
  selectedOption: IFilterOption;
  onSelect: (option: IFilterOption) => void;
  showSearch?: boolean;
}

export function FilterDropdown({ title, options, selectedOption, onSelect, showSearch = true }: FilterDropdownProps) {
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  return (
    <View className="bg-white">
      <View className="flex-row justify-between items-center">
        <TouchableOpacity
          className="flex-row items-center border border-gray-300 rounded-full px-4 py-2 flex-1 mr-2"
          onPress={() => setShowFilterOptions(!showFilterOptions)}
        >
          <Text className="text-gray-800 font-medium flex-1">{selectedOption.label}</Text>
          <ChevronDown size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {showFilterOptions && (
        <View className="absolute top-12 z-10 bg-white border border-gray-300 rounded-md w-[95%]">
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              className="p-3 border-b border-gray-200"
              style={{ borderBottomWidth: index === options.length - 1 ? 0 : 1 }}
              onPress={() => {
                onSelect(option);
                setShowFilterOptions(false);
              }}
            >
              <Text className="text-gray-800">{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
