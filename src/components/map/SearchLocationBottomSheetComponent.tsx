import { useMapboxSearch } from "@/hooks/useMapboxSearch";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text } from "../ui";

const SearchLocationBottomSheetComponent = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const { results, loading, error } = useMapboxSearch(searchQuery);

    return (
        <View
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
            }}
        >
            <GestureHandlerRootView className="flex-1 bg-transparent">
                <BottomSheet
                    snapPoints={["25%", "50%", "75%"]}
                    backgroundStyle={{
                        backgroundColor: "rgba(20, 30, 48, 0.25)",
                    }}
                    handleStyle={{
                        backgroundColor: "transparent",
                    }}
                    handleIndicatorStyle={{
                        backgroundColor: "rgba(255,255,255,0.3)",
                    }}
                    enableContentPanningGesture={true}
                >
                    <SafeAreaView className="flex-1 bg-transparent">
                        <View className="flex-row items-center px-4 pt-4 pb-8">
                            <View className="flex-1 flex-row items-center bg-[#rgba(20, 30, 48, 0.25)] rounded-full h-16 px-4">
                                <Ionicons
                                    name="search"
                                    size={20}
                                    color="#D9D9D9"
                                    style={{ marginRight: 8 }}
                                />
                                <TextInput
                                    className="flex-1 text-[#D9D9D9] text-base h-11"
                                    placeholder="Search Maps"
                                    placeholderTextColor="rgba(255,255,255,0.7)"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    autoFocus
                                />
                            </View>
                        </View>
                        <BottomSheetScrollView
                            contentContainerStyle={{
                                padding: 16,
                                backgroundColor: "transparent",
                            }}
                            style={{ backgroundColor: "transparent" }}
                        >
                            {loading && (
                                <ActivityIndicator color="#fff" size="small" />
                            )}

                            {!loading &&
                                searchQuery &&
                                results.length > 0 &&
                                results.map((item, index) => (
                                    <TouchableOpacity
                                        key={item.mapbox_id || index}
                                        className="bg-white/10 p-4 rounded-2xl mb-2"
                                    >
                                        <Text className="text-white text-base font-semibold">
                                            {item.name || "Unknown place"}
                                        </Text>
                                        <Text className="text-gray-300 text-sm mt-1">
                                            {item.full_address ||
                                                item.address ||
                                                "No address available"}
                                        </Text>
                                    </TouchableOpacity>
                                ))}

                            {!loading &&
                                searchQuery &&
                                results.length === 0 && (
                                    <Text className="text-gray-400 text-center mt-4">
                                        No results found
                                    </Text>
                                )}
                        </BottomSheetScrollView>
                    </SafeAreaView>
                </BottomSheet>
            </GestureHandlerRootView>
        </View>
    );
};

export default SearchLocationBottomSheetComponent;
