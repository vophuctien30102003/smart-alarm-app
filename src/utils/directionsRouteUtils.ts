
import polyline from "@mapbox/polyline";

export interface RouteInfo {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
  overview_polyline: string;
}

export interface DirectionsResponse {
  routes: {
    legs: {
      distance: { text: string; value: number };
      duration: { text: string; value: number };
    }[];
    overview_polyline: {
      points: string;
    };
  }[];
  status: string;
}

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyC-wKHZs9mysoYO9MNgglkP1ZVb8auj2WI';

export async function getDirections(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  mode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving'
): Promise<RouteInfo | null> {
  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destinationStr = `${destination.latitude},${destination.longitude}`;
    
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json() as DirectionsResponse;
    
    if (data.status !== 'OK' || !data.routes.length) {
      console.error('Directions API error:', data.status);
      return null;
    }
    
    const route = data.routes[0];
    const leg = route.legs[0];
    
    const points = polyline.decode(route.overview_polyline.points);
    const coordinates = points.map((point: [number, number]) => ({
      latitude: point[0],
      longitude: point[1]
    }));
    
    return {
      distance: leg.distance,
      duration: leg.duration,
      coordinates,
      overview_polyline: route.overview_polyline.points
    };
  } catch (error) {
    console.error('Error fetching directions:', error);
    return null;
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

export default async function getDirectionsLegacy(
    latStart: number,
    longStart: number,
    latEnd: number,
    longEnd: number
): Promise<RouteInfo | null> {
    return getDirections(
        { latitude: latStart, longitude: longStart },
        { latitude: latEnd, longitude: longEnd }
    );
}