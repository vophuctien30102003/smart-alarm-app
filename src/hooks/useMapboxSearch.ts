import type { Coordinates } from "@/shared/types/alarmLocation.type";
import { debounce, SearchBoxCore, SessionToken } from "@mapbox/search-js-core";
import Constants from "expo-constants";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MAPBOX_TOKEN = String(Constants.expoConfig?.extra?.mapboxAccessToken);
const search = new SearchBoxCore({ accessToken: MAPBOX_TOKEN });

export interface MapboxSearchResult {
    id: string;
    name: string;
    address: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    mapbox_id: string;
}

export const useMapboxSearch = (query: string, userLocation?: Coordinates | null) => {
    const [results, setResults] = useState<MapboxSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sessionTokenRef = useRef<SessionToken>(new SessionToken());

    const debouncedSearch = useMemo(
        () =>
            debounce(async (searchQuery: string) => {
            if (!searchQuery.trim()) {
                setResults([]);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const sessionToken = sessionTokenRef.current;
                const result = await search.suggest(searchQuery, {
                    sessionToken,
                    proximity: userLocation
                        ? [userLocation.longitude, userLocation.latitude]
                        : undefined,
                });
                const formattedResults = await Promise.all(
                    result.suggestions.map(async (suggestion) => {
                        try {
                            const { features } = await search.retrieve(suggestion, { sessionToken });
                            if (features.length > 0) {
                                const feature = features[0];
                                const [longitude, latitude] = feature.geometry.coordinates;
                                const externalId = suggestion.external_ids ? 
                                    Object.values(suggestion.external_ids)[0] : "";
                                return {
                                    id: suggestion.mapbox_id || externalId || `${Date.now()}-${Math.random()}`,
                                    name: suggestion.name || "Unknown place",
                                    address: suggestion.full_address || suggestion.place_formatted || "No address available",
                                    coordinates: {
                                        latitude,
                                        longitude,
                                    },
                                    mapbox_id: suggestion.mapbox_id || externalId || "",
                                } as MapboxSearchResult;
                            }
                            return null;
                        } catch (error) {
                            console.warn("Failed to retrieve feature for suggestion:", suggestion.name, error);
                            return null;
                        }
                    })
                );
                const validResults = formattedResults.filter((result): result is MapboxSearchResult => result !== null);
                setResults(validResults);

            } catch (error) {
                console.error("Failed to fetch search results", error);
            } finally {
                setLoading(false);
            }
        }, 1500),
    [userLocation]
    );

    const resetSession = useCallback(() => {
        sessionTokenRef.current = new SessionToken();
        setResults([]);
        setError(null);
    }, []);

    useEffect(() => {
        return () => {
            sessionTokenRef.current = new SessionToken();
        };
    }, []);

    useEffect(() => {
        if (userLocation) {
            sessionTokenRef.current = new SessionToken();
        }
    }, [userLocation]);

    useEffect(() => {
        debouncedSearch(query);
    }, [debouncedSearch, query]);

    return { 
        results, 
        loading, 
        error, 
        resetSession
    };
};