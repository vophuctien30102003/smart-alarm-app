import MapViewComponent from "@/components/map/MapViewComponent";
import { useLocationStore } from "@/store/locationStore";
import { LocationType } from "@/types/Location";
import SearchLocation from "@/utils/searchLocationUtils";
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface AddLocationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddLocationModal({ visible, onClose }: AddLocationModalProps) {
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("📍");
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { addToFavorites } = useLocationStore();

  const commonIcons = ["📍", "🏠", "🏢", "🏫", "🏥", "🛒", "☕", "🍽️", "🚗", "✈️"];

  const handleSave = async () => {
    if (!label.trim()) {
      Alert.alert("Error", "Please enter a location label");
      return;
    }

    if (!selectedLocation) {
      Alert.alert("Error", "Please select a location");
      return;
    }

    try {
      setLoading(true);
      addToFavorites(selectedLocation, label.trim(), icon);
      Alert.alert("Success", "Location added to favorites!");
      handleClose();
    } catch {
      Alert.alert("Error", "Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLabel("");
    setIcon("📍");
    setSelectedLocation(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Add Location</Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={loading || !selectedLocation || !label.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text className={`font-medium ${
                selectedLocation && label.trim() ? 'text-blue-500' : 'text-gray-400'
              }`}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4">
          {/* Search Location */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Search Location
            </Text>
            <SearchLocation 
              onLocationSelect={(location) => setSelectedLocation(location)}
              placeholder="Search for places..."
            />
          </View>

          {/* Map View */}
          {selectedLocation && (
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Location Preview
              </Text>
              <View className="h-48 rounded-lg overflow-hidden border border-gray-200">
                <MapViewComponent
                  selectedLocation={selectedLocation}
                  onLocationSelect={(location) => setSelectedLocation(location)}
                  showRoute={false}
                  showCurrentLocation={true}
                  markers={[]}
                />
              </View>
            </View>
          )}

          {/* Selected Location Preview */}
          {selectedLocation && (
            <View className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="text-green-800 font-medium ml-2">Location Selected</Text>
              </View>
              <Text className="text-green-700 font-medium">{selectedLocation.name}</Text>
              <Text className="text-green-600 text-sm">{selectedLocation.address}</Text>
            </View>
          )}

          {/* Label Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Location Label
            </Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="Enter a name for this location"
              className="border border-gray-300 rounded-lg px-3 py-3 text-base"
            />
          </View>

          {/* Icon Selection */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Choose Icon
            </Text>
            <View className="flex-row flex-wrap">
              {commonIcons.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setIcon(emoji)}
                  className={`w-12 h-12 items-center justify-center m-1 rounded-lg border-2 ${
                    icon === emoji 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text className="text-xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View className="mb-6 p-4 bg-gray-50 rounded-lg">
            <Text className="text-sm font-medium text-gray-700 mb-2">Preview</Text>
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full items-center justify-center mr-3 bg-blue-100">
                <Text className="text-xl">{icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  {label || "Location Name"}
                </Text>
                <Text className="text-sm text-gray-600">
                  {selectedLocation?.address || "Address will appear here"}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
