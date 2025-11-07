import { Coordinates } from '@/shared/types/alarmLocation.type';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

type UseLocationPermissionResult = {
	hasLocationPermission: boolean;
	currentLocation: Coordinates | null;
	requestPermission: () => Promise<void>;
};

const useLocationPermission = (): UseLocationPermissionResult => {
	const [hasLocationPermission, setHasLocationPermission] = useState(false);
	const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
	const requestPermission = useCallback(async () => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				setHasLocationPermission(false);
				setCurrentLocation(null);
				Alert.alert(
					'Permission Required',
					'Location permission is required to show your position on the map',
					[{ text: 'OK' }],
				);
				return;
			}
			setHasLocationPermission(true);
			const position = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.High,
			});
			setCurrentLocation({
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			});
		} catch (error) {
			console.error('Error requesting location permission:', error);
		}
	}, []);
	useEffect(() => {
		void requestPermission();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only request permission once on mount

	return {
		hasLocationPermission,
		currentLocation,
		requestPermission,
	};
};
export default useLocationPermission;