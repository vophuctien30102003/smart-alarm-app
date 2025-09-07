import { useLocationStore } from "@/store/locationStore";
import { LocationType } from "@/types/Location";
import { generateId } from "@/utils/idUtils";
import React, { useCallback, useRef } from "react";
import { Alert, StyleSheet } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

interface SearchLocationProps {
  onLocationSelect?: (location: LocationType) => void;
  placeholder?: string;
  showDirections?: boolean;
  containerStyle?: any;
  autoFocus?: boolean;
  searchRadius?: number;
  enablePoweredByGoogle?: boolean;
  minLength?: number;
  debounce?: number;
  styles?: {
    container?: any;
    textInput?: any;
    listView?: any;
    row?: any;
    description?: any;
  };
  onError?: (error: any) => void;
  value?: string;
  onChangeText?: (text: string) => void;
  renderRow?: (data: any) => React.ReactElement;
  query?: {
    key: string;
    language?: string;
    components?: string;
    location?: string;
    radius?: number;
    types?: string;
  };
}

export default function SearchLocation({
  onLocationSelect,
  placeholder = "Search for places...",
  showDirections = false,
  containerStyle,
  autoFocus = false,
  searchRadius = 50000,
  enablePoweredByGoogle = true,
  minLength = 2,
  debounce = 300,
  styles: customStyles = {},
  onError,
  value,
  onChangeText,
  renderRow,
  query,
}: SearchLocationProps) {
  const { addToSearchHistory } = useLocationStore();
  const ref = useRef<any>(null);

  const handleLocationSelect = useCallback(
    async (data: any, details: any = null) => {
      try {
        if (!details?.geometry?.location) {
          throw new Error('Location details not available');
        }

        const locationData: LocationType = {
          id: details.place_id || generateId(),
          name: data.structured_formatting?.main_text || data.description.split(',')[0],
          address: details.formatted_address || data.description,
          coordinates: {
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
          },
          createdAt: new Date(),
        };

        addToSearchHistory(locationData);
        
        onLocationSelect?.(locationData);

        ref.current?.clear();
      } catch (error) {
        console.error('Error selecting location:', error);
        onError?.(error);
        Alert.alert('Error', 'Failed to select location. Please try again.');
      }
    },
    [onLocationSelect, addToSearchHistory, onError]
  );

  const defaultQuery = {
    key: process.env.GOOGLE_MAPS_API_KEY || '',
    language: 'en',
    components: 'country:vn',
    types: 'establishment|geocode',
    ...query,
  };

  const defaultStyles = {
    container: [styles.container, customStyles.container],
    textInput: [styles.textInput, customStyles.textInput],
    listView: [styles.listView, customStyles.listView],
    row: [styles.row, customStyles.row],
    description: [styles.description, customStyles.description],
  };

  return (
    <GooglePlacesAutocomplete
      ref={ref}
      placeholder={placeholder}
      minLength={minLength}
      debounce={debounce}
      fetchDetails={true}
      onPress={handleLocationSelect}
      onFail={(error) => {
        console.error('GooglePlacesAutocomplete error:', error);
        onError?.(error);
      }}
      query={defaultQuery}
      styles={defaultStyles}
      textInputProps={{
        autoCorrect: false,
        autoCapitalize: 'none',
        placeholderTextColor: '#666',
        autoFocus: autoFocus,
        returnKeyType: 'search',
      }}
      listEmptyComponent={() => null}
      enablePoweredByContainer={enablePoweredByGoogle}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
  },
  textInput: {
    backgroundColor: 'white',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listView: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 300,
  },
  row: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  description: {
    fontSize: 16,
    color: '#333',
  },
});
