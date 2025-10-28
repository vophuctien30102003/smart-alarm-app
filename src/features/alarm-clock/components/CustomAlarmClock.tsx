import { Switch } from '@/components/ui';
import { Text } from '@/components/ui/text';
import Slider from '@react-native-community/slider';
import { ArrowDown2 } from 'iconsax-react-native';
import { useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

interface SoundOption {
    id: string;
    title: string;
}

interface Props {
    gentleWakeMinutes: number;
    onSelectGentleWake: (value: number) => void;
    gentleWakeOptions: number[];
    snoozeEnabled: boolean;
    onToggleSnooze: (value: boolean) => void;
    snoozeMinutes: number;
    snoozeOptions: number[];
    onSelectSnooze: (value: number) => void;
    volume: number;
    onChangeVolume: (value: number) => void;
    soundId: string;
    soundOptions: SoundOption[];
    onSelectSound: (value: string) => void;
    vibrate: boolean;
    onToggleVibrate: (value: boolean) => void;
}

const formatMinutesLabel = (minutes: number): string => {
    if (minutes === 0) {
        return 'Off';
    }
    return `${minutes} min`;
};

export function CustomAlarmClock({
    gentleWakeMinutes,
    onSelectGentleWake,
    gentleWakeOptions,
    snoozeEnabled,
    onToggleSnooze,
    snoozeMinutes,
    snoozeOptions,
    onSelectSnooze,
    volume,
    onChangeVolume,
    soundId,
    soundOptions,
    onSelectSound,
    vibrate,
    onToggleVibrate,
}: Props) {
    const [showDetails, setShowDetails] = useState(true);

    const currentSoundLabel = useMemo(() => {
        return soundOptions.find(option => option.id === soundId)?.title ?? 'Default';
    }, [soundId, soundOptions]);

    return (
        <View className="mt-8">
            <View className="flex-row justify-between items-center py-3">
                <Text className="text-[#F8FAFC] text-[17px] font-semibold">
                    Custom alarm
                </Text>
                <TouchableOpacity
                    className="bg-[#9887C340] rounded-full p-2"
                    onPress={() => setShowDetails(!showDetails)}
                    accessibilityRole="button"
                    accessibilityLabel="Toggle custom alarm settings"
                >
                    <ArrowDown2
                        size="24"
                        color="#d9e3f0"
                        style={{ transform: [{ rotate: showDetails ? '180deg' : '0deg' }] }}
                    />
                </TouchableOpacity>
            </View>

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
                        valueLabel={snoozeEnabled ? formatMinutesLabel(snoozeMinutes) : 'Off'}
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
                        <View className="mt-3">
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
                        </View>
                    </SettingRow>

                    <SettingRow
                        title="Alarm sound"
                        icon="🎶"
                        valueLabel={currentSoundLabel}
                    >
                        <OptionChips
                            options={soundOptions.map(option => option.id)}
                            selectedValue={soundId}
                            onSelect={onSelectSound}
                            renderLabel={value => soundOptions.find(option => option.id === value)?.title ?? value}
                        />
                    </SettingRow>

                    <SettingRow
                        title="Vibration"
                        icon="📳"
                        valueLabel={vibrate ? 'On' : 'Off'}
                    >
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
}

interface SettingRowProps {
    title: string;
    icon: string;
    valueLabel: string;
    children: React.ReactNode;
}

function SettingRow({ title, icon, valueLabel, children }: SettingRowProps) {
    return (
        <View className="border border-white/10 rounded-2xl p-4 bg-white/5">
            <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                    <Text className="text-base mr-3">{icon}</Text>
                    <Text className="text-white text-base font-medium">
                        {title}
                    </Text>
                </View>
                <Text className="text-[#8179FF] text-sm font-medium">
                    {valueLabel}
                </Text>
            </View>
            {children}
        </View>
    );
}

interface OptionChipsProps<T extends string | number> {
    options: T[];
    selectedValue: T;
    onSelect: (value: T) => void;
    disabled?: boolean;
    renderLabel?: (value: T) => string;
}

function OptionChips<T extends string | number>({
    options,
    selectedValue,
    onSelect,
    disabled = false,
    renderLabel,
}: OptionChipsProps<T>) {
    return (
        <View className="flex-row flex-wrap gap-2">
            {options.map(option => {
                const isSelected = option === selectedValue;
                const label = renderLabel ? renderLabel(option) : formatMinutesLabel(Number(option));
                return (
                    <TouchableOpacity
                        key={String(option)}
                        className={`px-3 py-1 rounded-full border ${
                            isSelected ? 'bg-[#8179FF] border-transparent' : 'bg-white/10 border-white/20'
                        } ${disabled ? 'opacity-40' : ''}`}
                        disabled={disabled}
                        onPress={() => onSelect(option)}
                    >
                        <Text className="text-white text-sm font-medium">
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
