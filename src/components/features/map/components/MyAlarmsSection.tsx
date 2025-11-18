import { Switch, Text } from '@/components/ui';
import { useAlarms } from '@/hooks/useAlarms';
import { useDistanceText } from '@/hooks/useDistanceText';
import { isLocationAlarm} from '@/shared/types/alarm.type';
import { selectAlarms, useAlarmStore } from '@/store/alarmStore';
import { useLocationStore } from '@/store/locationStore';
import { ArrowRight2 } from 'iconsax-react-native';
import React, { useCallback, useMemo } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';

interface MyAlarmsSectionProps {
  searchQuery: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}

function MyAlarmsSection({
  searchQuery,
  currentLocation,
}: MyAlarmsSectionProps) {
  const alarms = useAlarmStore(selectAlarms);
  const { toggleAlarm } = useAlarms();
  const getDistanceText = useDistanceText({ currentLocation });

  const locationAlarms = useMemo(
    () => alarms.filter(isLocationAlarm),
    [alarms],
  );

  const recentAlarms = useMemo(() =>
    [...locationAlarms]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
  [locationAlarms]);

  const shouldShowRecentAlarms = useMemo(
    () => !searchQuery && recentAlarms.length > 0,
    [searchQuery, recentAlarms.length]
  );


  const handleToggleActive = useCallback(
    async (id: string) => {
      try {
        await toggleAlarm(id);
      } catch (error) {
        console.error('Error toggling alarm:', error);
        Alert.alert('Error', 'Failed to update alarm status');
      }
    },
    [toggleAlarm]
  );
    
  return (
    <>
      <View className='flex-row justify-between items-center mt-6 '>
        <Text className="text-white text-[15px] font-inter font-[600] px-1">
          My Alarms
        </Text>
        <TouchableOpacity 
          className='flex-row items-center'
        >
          <Text className='text-[#F8FAFC] text-[13px] font-inter font-[400]'>{locationAlarms.length} Locations </Text>
          <ArrowRight2 size="16" className='py-2' color="#F8FAFC"/>
        </TouchableOpacity>
      </View>
      {shouldShowRecentAlarms && (
        <View className="mt-4">
          {recentAlarms.map(alarm => {
            const distanceText = currentLocation
              ? getDistanceText(
                  alarm.targetLocation.coordinates.latitude,
                  alarm.targetLocation.coordinates.longitude,
                )
              : null;

            return (
              <TouchableOpacity
                key={alarm.id}
                className="bg-[#362e4b] p-4 rounded-2xl mb-2"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-white text-base font-semibold">
                      {alarm.label}
                    </Text>
                    <Text className="text-gray-300 text-sm mt-1">
                      {alarm.targetLocation.address}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-blue-400 text-xs">
                        Radius: {(alarm.radiusMeters ?? 0)}m 
                      </Text>
                      {distanceText && (
                        <Text className="text-yellow-400 text-xs ml-2">
                          •{distanceText}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className="ml-3 flex items-center">
                    <Switch 
                      value={alarm.isEnabled} 
                      onValueChange={() => handleToggleActive(alarm.id)}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </>
  );
}

export default React.memo(MyAlarmsSection);

