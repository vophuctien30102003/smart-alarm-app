import { useLocationStore } from "@/store/locationStore";
import { LocationType } from "@/types/Location";
import { generateId } from "@/utils/idUtils";
import { useCallback, useRef } from "react";
import { Alert, View } from "react-native";
import {
    GooglePlacesAutocomplete,
    GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import { Text } from "./ui";

interface GooglePlaceData {
    description: string;
    structured_formatting?: {
        main_text: string;
        secondary_text: string;
    };
    place_id: string;
}

interface GooglePlaceDetails {
    place_id: string;
    formatted_address: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
}

interface SearchLocationProps {
    placeholder?: string;
    autoFocus?: boolean;
    saveToStore?: boolean;
    onError?: (error: Error) => void;
}

export default function SearchLocation() {
    // const ref = useRef<GooglePlacesAutocompleteRef>(null);
    const { setPreviewLocation, setSelectedLocation } = useLocationStore();

    // const handleLocationSelect = useCallback(
    //     async (
    //         data: GooglePlaceData,
    //         details: GooglePlaceDetails | null = null
    //     ) => {
    //         try {
    //             if (!details?.geometry?.location) {
    //                 throw new Error("Location details not available");
    //             }

    //             const locationData: LocationType = {
    //                 id: details.place_id || generateId(),
    //                 name:
    //                     data.structured_formatting?.main_text ||
    //                     data.description.split(",")[0],
    //                 address: details.formatted_address || data.description,
    //                 coordinates: {
    //                     latitude: details.geometry.location.lat,
    //                     longitude: details.geometry.location.lng,
    //                 },
    //                 createdAt: new Date(),
    //             };

    //             // if (saveToStore) {
    //             //     setPreviewLocation(locationData);
    //             //     setSelectedLocation(locationData);
    //             // }

    //             ref.current?.clear();
    //         } catch (error) {
    //             console.error("Error selecting location:", error);
    //             Alert.alert(
    //                 "Error",
    //                 "Failed to select location. Please try again."
    //             );
    //         }
    //     },
    //     [ setPreviewLocation, setSelectedLocation]
    // );

    const defaultQuery = {
        key: process.env.GOOGLE_MAPS_API_KEY || "",
        language: "en",
        components: "country:vn",
        types: "establishment|geocode",
    };

    return (
        <View className="flex-1 z-10">
            <GooglePlacesAutocomplete
                // ref={ref}
                placeholder={`Search for a location`}
                minLength={2}
                debounce={300}
                fetchDetails
                query={defaultQuery}
                // onPress={handleLocationSelect}
                onFail={(error: Error) => {
                    console.error("GooglePlacesAutocomplete error:", error);
                    // onError?.(error);
                }}
                textInputProps={{
                    autoCorrect: false,
                    autoCapitalize: "none",
                    // autoFocus,
                    placeholderTextColor: "#666",
                    returnKeyType: "search",
                    onChangeText: (text: string) => {
                        console.log("User typing:", text);
                    },
                }}
                styles={{
                    textInput: {
                        backgroundColor: "white",
                        height: 50,
                        borderRadius: 10,
                        paddingHorizontal: 15,
                        fontSize: 16,
                        borderWidth: 1,
                        borderColor: "#E5E5E5",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3.84,
                        elevation: 5,
                    },
                    listView: {
                        backgroundColor: "white",
                        borderRadius: 10,
                        marginTop: 5,
                        maxHeight: 300,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3.84,
                        elevation: 5,
                    },
                    row: {
                        paddingVertical: 15,
                        paddingHorizontal: 15,
                        borderBottomWidth: 1,
                        borderBottomColor: "#F0F0F0",
                    },
                    description: {
                        fontSize: 16,
                        color: "#333",
                    },
                }}
                enablePoweredByContainer={false}
                listEmptyComponent={() => (
                    <View className="p-4">
                        <Text className="text-gray-500">No results found</Text>
                    </View>
                )}
            />
        </View>
    );
}
