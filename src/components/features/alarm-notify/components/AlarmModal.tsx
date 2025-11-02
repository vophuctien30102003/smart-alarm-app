import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Modal, View } from "react-native";
import { useAlarmOverlay } from "@/hooks/useAlarmOverlay";
import { AlarmPlayer } from "./AlarmPlayer";

export function AlarmModal() {
  const {
    alarmIcon,
    alarmLabel,
    alarmTimeText,
    handleSnooze,
    handleStop,
    isSnoozeEnabled,
    shouldShowModal,
    snoozeText,
  } = useAlarmOverlay();

  if (!shouldShowModal) return null;

  return (
    <>
      <AlarmPlayer />

      <Modal
        visible
        animationType="fade"
        transparent
        presentationStyle="overFullScreen"
      >
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View className="bg-white rounded-2xl border-2 border-red-500 p-6 w-72 items-center shadow-xl">
            <Text className="text-6xl mb-4">{alarmIcon || "😴"}</Text>

            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {alarmLabel || "Alarm"}
            </Text>

            <Text className="text-lg text-gray-600 mb-6 text-center">
              {alarmTimeText || "14:00 → 06:15"}
            </Text>

            {/* Buttons */}
            <View className="w-full space-y-3">
              {isSnoozeEnabled && (
                <Button
                  className="bg-orange-500 p-4 rounded-lg"
                  onPress={handleSnooze}
                >
                  <Text className="text-white text-center font-semibold text-lg">
                    {snoozeText || "Snooze 5 min"}
                  </Text>
                </Button>
              )}

              <Button
                className="bg-red-500 p-4 rounded-lg"
                onPress={handleStop}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Stop Alarm
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
