import { useMemo, useState, useCallback } from "react";
import { View, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { ArrowDown2 } from "iconsax-react-native";
import { Switch } from "@/components/ui";
import { Text } from "@/components/ui/text";
import { SettingRow } from "./SettingRow";
import { OptionChips } from "./OptionChips";

interface SoundOption {
  id: string;
  title: string;
}

interface Props {
  gentleWakeMinutes: number;
  gentleWakeOptions: number[];
  onSelectGentleWake: (value: number) => void;

  snoozeEnabled: boolean;
  snoozeMinutes: number;
  snoozeOptions: number[];
  onToggleSnooze: (value: boolean) => void;
  onSelectSnooze: (value: number) => void;

  volume: number;
  onChangeVolume: (value: number) => void;

  soundId: string;
  soundOptions: SoundOption[];
  onSelectSound: (value: string) => void;

  vibrate: boolean;
  onToggleVibrate: (value: boolean) => void;
}

const formatMinutesLabel = (minutes: number): string =>
  minutes === 0 ? "Off" : `${minutes} min`;

export const CustomAlarmClock = ({
  gentleWakeMinutes,
  gentleWakeOptions,
  onSelectGentleWake,
  snoozeEnabled,
  snoozeMinutes,
  snoozeOptions,
  onToggleSnooze,
  onSelectSnooze,
  volume,
  onChangeVolume,
  soundId,
  soundOptions,
  onSelectSound,
  vibrate,
  onToggleVibrate,
}: Props) => {
  const [showDetails, setShowDetails] = useState(true);

  const currentSoundLabel = useMemo(
    () => soundOptions.find((s) => s.id === soundId)?.title ?? "Default",
    [soundId, soundOptions]
  );

  const toggleDetails = useCallback(() => setShowDetails((prev) => !prev), []);

  return (
    <View className="mt-8">
      <View className="flex-row justify-between items-center py-3">
        <Text className="text-[#F8FAFC] text-[17px] font-semibold">
          Custom alarm
        </Text>
        <TouchableOpacity
          className="bg-[#9887C340] rounded-full p-2"
          onPress={toggleDetails}
          accessibilityRole="button"
          accessibilityLabel="Toggle custom alarm settings"
        >
          <ArrowDown2
            size="24"
            color="#d9e3f0"
            style={{
              transform: [{ rotate: showDetails ? "180deg" : "0deg" }],
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Settings */}
      {showDetails && (
        <View className="space-y-4 flex-col gap-4 mb-4">
          <SettingRow
            title="Gentle wake up"
            icon="🎵"
            valueLabel={formatMinutesLabel(gentleWakeMinutes)}
          >
            <OptionChips
              options={gentleWakeOptions}
              selectedValue={gentleWakeMinutes}
              onSelect={onSelectGentleWake}
            />
          </SettingRow>

          <SettingRow
            title="Snooze"
            icon="⏰"
            valueLabel={snoozeEnabled ? formatMinutesLabel(snoozeMinutes) : "Off"}
          >
            <View className="flex-row items-center justify-between">
              <Switch
                value={snoozeEnabled}
                onValueChange={onToggleSnooze}
                accessibilityLabel="Toggle snooze"
              />
              <OptionChips
                options={snoozeOptions}
                selectedValue={snoozeMinutes}
                onSelect={onSelectSnooze}
                disabled={!snoozeEnabled}
              />
            </View>
          </SettingRow>

          <SettingRow
            title="Alarm volume"
            icon="🔊"
            valueLabel={`${Math.round(volume * 100)}%`}
          >
            <Slider
              value={volume}
              onValueChange={onChangeVolume}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              minimumTrackTintColor="#8179FF"
              maximumTrackTintColor="rgba(255,255,255,0.2)"
              thumbTintColor="#FFFFFF"
              accessibilityLabel="Adjust alarm volume"
            />
          </SettingRow>

          <SettingRow title="Alarm sound" icon="🎶" valueLabel={currentSoundLabel}>
            <OptionChips
              options={soundOptions.map((s) => s.id)}
              selectedValue={soundId}
              onSelect={onSelectSound}
              renderLabel={(v) =>
                soundOptions.find((s) => s.id === v)?.title ?? v
              }
            />
          </SettingRow>

          <SettingRow title="Vibration" icon="📳" valueLabel={vibrate ? "On" : "Off"}>
            <Switch
              value={vibrate}
              onValueChange={onToggleVibrate}
              accessibilityLabel="Toggle vibration"
            />
          </SettingRow>
        </View>
      )}
    </View>
  );
};

