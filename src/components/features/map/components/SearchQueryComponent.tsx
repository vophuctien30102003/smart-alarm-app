import { Text } from '@/components/ui';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

interface SearchResult {
  mapbox_id?: string;
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface SearchQueryComponentProps {
  loading: boolean;
  searchQuery: string;
  results: SearchResult[];
  currentLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  getDistanceText: (targetLat: number, targetLng: number) => string;
}

export default function SearchQueryComponent({
  loading,
  searchQuery,
  results,
  currentLocation,
  getDistanceText,
}: SearchQueryComponentProps) {
  return (
    <BottomSheetScrollView
      contentContainerStyle={{
        paddingVertical: 16,
        backgroundColor: 'transparent',
      }}
      style={{ backgroundColor: 'transparent' }}
    >
      {loading && <ActivityIndicator color="#fff" size="small" />}

      {!loading &&
        searchQuery &&
        results.length > 0 &&
        results.map((item, index) => (
          <TouchableOpacity
            key={item.mapbox_id || index}
            className="bg-white/10 p-4 rounded-2xl mb-2"
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-white text-base font-semibold">
                  {item.name || 'Unknown place'}
                </Text>
                <Text className="text-gray-300 text-sm mt-1">
                  {item.address || 'No address available'}
                </Text>
              </View>
              {currentLocation && (
                <Text className="text-blue-400 text-xs ml-2">
                  {getDistanceText(item.coordinates.latitude, item.coordinates.longitude)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      {!loading && searchQuery && results.length === 0 && (
        <Text className="text-gray-400 text-center mt-4"> 
          No results found
        </Text>
      )}
    </BottomSheetScrollView>
  );
}

