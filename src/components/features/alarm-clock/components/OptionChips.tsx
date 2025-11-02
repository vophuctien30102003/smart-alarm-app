import { useCallback } from "react";
import { View, TouchableOpacity, Text } from "react-native";

interface OptionChipsProps<T extends string | number> {
    options: T[];
    selectedValue: T;
    onSelect: (value: T) => void;
    disabled?: boolean;
    renderLabel?: (value: T) => string;
}

export const OptionChips = <T extends string | number>({
    options,
    selectedValue,
    onSelect,
    disabled = false,
    renderLabel,
}: OptionChipsProps<T>) => {
    const handleSelect = useCallback(
        (option: T) => {
            if (!disabled) onSelect(option);
        },
        [onSelect, disabled]
    );
    const formatMinutesLabel = (minutes: number): string =>
        minutes === 0 ? "Off" : `${minutes} min`;
    return (
        <View className="flex-row flex-wrap gap-2">
            {options.map((option) => {
                const isSelected = option === selectedValue;
                const label = renderLabel
                    ? renderLabel(option)
                    : formatMinutesLabel(Number(option));
                return (
                    <TouchableOpacity
                        key={String(option)}
                        className={`px-3 py-1 rounded-full border ${
                            isSelected
                                ? "bg-[#8179FF] border-transparent"
                                : "bg-white/10 border-white/20"
                        } ${disabled ? "opacity-40" : ""}`}
                        disabled={disabled}
                        onPress={() => handleSelect(option)}
                    >
                        <Text className="text-white text-sm font-medium">
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};
