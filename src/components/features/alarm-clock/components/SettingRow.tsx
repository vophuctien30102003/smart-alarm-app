import { View, Text } from "react-native";

interface SettingRowProps {
  title: string;
  icon: string;
  valueLabel: string;
  children: React.ReactNode;
}

export const SettingRow = ({ title, icon, valueLabel, children }: SettingRowProps) => (
  <View className="border border-white/10 rounded-2xl p-4 bg-white/5">
    <View className="flex-row justify-between items-center mb-3">
      <View className="flex-row items-center">
        <Text className="text-base mr-3">{icon}</Text>
        <Text className="text-white text-base font-medium">{title}</Text>
      </View>
      <Text className="text-[#8179FF] text-sm font-medium">{valueLabel}</Text>
    </View>
    {children}
  </View>
);
