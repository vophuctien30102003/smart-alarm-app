import { useEffect, useRef, useState } from "react";
import { FlatList, Text, View, NativeSyntheticEvent, NativeScrollEvent } from "react-native";

const ITEM_HEIGHT = 50;

const numbers = (max: number) => Array.from({ length: max }, (_, i) => i);

interface CustomTimePickerProps {
  initialHour?: number;
  initialMinute?: number;
  onTimeChange?: (hour: number, minute: number) => void;
}

export default function CustomTimePicker({
  initialHour = 12,
  initialMinute = 30,
  onTimeChange,
}: CustomTimePickerProps) {
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);

  const hourRef = useRef<FlatList<number>>(null);
  const minuteRef = useRef<FlatList<number>>(null);

  useEffect(() => {
    onTimeChange?.(hour, minute);
  }, [hour, minute]);

  const onScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
    type: "hour" | "minute"
  ) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (type === "hour") setHour(index);
    else setMinute(index);
  };

  const renderItem = (item: number, selected: number) => {
    const isSelected = item === selected;
    return (
      <View
        style={{
          height: ITEM_HEIGHT,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 22,
            fontFamily: "monospace",
            color: isSelected ? "orange" : "gray",
          }}
        >
          {item.toString().padStart(2, "0")}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: ITEM_HEIGHT * 5, 
        width: "80%",
      }}
    >
      <FlatList
        ref={hourRef}
        data={numbers(24)}
        keyExtractor={(item) => item.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        initialScrollIndex={hour}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2, 
        }}
        onMomentumScrollEnd={(e) => onScrollEnd(e, "hour")}
        renderItem={({ item }) => renderItem(item, hour)}
      />

      <Text style={{ color: "white", fontSize: 28, marginHorizontal: 8 }}>:</Text>

      <FlatList
        ref={minuteRef}
        data={numbers(60)}
        keyExtractor={(item) => item.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        initialScrollIndex={minute}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
        onMomentumScrollEnd={(e) => onScrollEnd(e, "minute")}
        renderItem={({ item }) => renderItem(item, minute)}
      />
    </View>
  );
}
