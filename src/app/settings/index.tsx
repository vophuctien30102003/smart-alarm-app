import { useState } from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

const GENTLE_WAKE_OPTIONS = [0, 5, 10, 15];
const SNOOZE_OPTIONS = [5, 10, 15, 20];
const SOUND_OPTIONS = ["Classic bell", "Digital", "Nature"];

interface SettingItemProps {
  icon?: string;
  label: string;
  rightContent: React.ReactNode;
}

function SettingItem({ icon, label, rightContent }: SettingItemProps) {
  return (
    <View className="bg-[#362e4b] rounded-2xl p-4 mb-4 flex-row items-center justify-between">
      <View className="flex-row items-center">
        {icon && (
          <Ionicons
            name={icon as any}
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
        )}
        <Text className="text-white text-base">{label}</Text>
      </View>
      {rightContent}
    </View>
  );
}

export default function Settings() {
  const [gentleWake, setGentleWake] = useState(5);
  const [snooze, setSnooze] = useState(10);
  const [volume, setVolume] = useState(0.5);
  const [sound, setSound] = useState(SOUND_OPTIONS[0]);
  const [vibration, setVibration] = useState(true);

  return (
    <View className="flex-1 bg-[#090212]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-16 mb-6">
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text className="text-white text-lg font-bold">Setting</Text>

        <TouchableOpacity>
          <Text className="text-[#8179FF] text-base font-semibold">Save</Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View className="flex-1 px-6">
        <SettingItem
          icon="alarm-outline"
          label="Gentle wake up"
          rightContent={
            <TouchableOpacity>
              <Text className="text-[#8179FF] text-base">{gentleWake} min</Text>
            </TouchableOpacity>
          }
        />

        <SettingItem
          icon="time-outline"
          label="Snooze"
          rightContent={
            <TouchableOpacity>
              <Text className="text-[#8179FF] text-base">{snooze} min</Text>
            </TouchableOpacity>
          }
        />

        <View className="bg-[#362e4b] rounded-2xl p-4 mb-4">
          <Text className="text-white text-base mb-2">Alarm volume</Text>
          <View className="flex-row items-center">
            <Text className="text-gray-400 mr-2">Min</Text>
            <Slider
              style={{ flex: 1 }}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={setVolume}
              minimumTrackTintColor="#8179FF"
              maximumTrackTintColor="#fff"
            />
            <Text className="text-gray-400 ml-2">Max</Text>
          </View>
        </View>

        <SettingItem
          icon="musical-notes-outline"
          label="Alarm sound"
          rightContent={
            <TouchableOpacity>
              <Text className="text-[#8179FF] text-base">{sound}</Text>
            </TouchableOpacity>
          }
        />

        <SettingItem
          icon="vibrate-outline"
          label="Vibration"
          rightContent={
            <Switch
              value={vibration}
              onValueChange={setVibration}
              trackColor={{ false: "#555", true: "#8179FF" }}
              thumbColor={vibration ? "#fff" : "#8179FF"}
            />
          }
        />
      </View>
    </View>
  );
}
