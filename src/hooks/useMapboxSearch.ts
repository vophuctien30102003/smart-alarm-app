import { debounce, SearchBoxCore, SessionToken } from "@mapbox/search-js-core";
import Constants from "expo-constants";
import { useCallback, useEffect, useState } from "react";

const MAPBOX_TOKEN = String(Constants.expoConfig?.extra?.mapboxAccessToken);
const search = new SearchBoxCore({ accessToken: MAPBOX_TOKEN });

export const useMapboxSearch = (query: string) => {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchText = useCallback(
        debounce(async (query: string) => {
            if (!query.trim()) return; 

            try {
                setLoading(true);
                setError(null);

                const sessionToken = new SessionToken();
                const result = await search.suggest(query, { sessionToken });
                setResults(result.suggestions);

                const allFeatures = await Promise.all(
                    result.suggestions.map(async (s) => {
                        const { features } = await search.retrieve(s, { sessionToken });
                        return features.map((f) => ({
                            name: s.name,
                            coordinates: f.geometry.coordinates,
                        }));
                    })
                );

                const flattened = allFeatures.flat();

                console.log("All suggestion features:", flattened);

            } catch (err) {
                console.error(err);
                setError("Failed to fetch search results");
            } finally {
                setLoading(false);
                console.log("Loading finished");
            }
        }, 300),
        []
    );

    useEffect(() => {
        searchText(query);
    }, [query]);

    return { results, loading, error };
};
