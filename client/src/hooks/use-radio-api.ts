import { useQuery } from "@tanstack/react-query";
import type { RadioStation } from "../types/radio";

const RADIO_BROWSER_URL = "https://de1.api.radio-browser.info/json/stations/search";

export function useTopStations() {
  return useQuery({
    queryKey: ["radio-stations", "top"],
    queryFn: async (): Promise<RadioStation[]> => {
      // Fetch top 300 stations that have geolocation info
      const params = new URLSearchParams({
        limit: "300",
        has_geo_info: "true",
        hidebroken: "true",
        order: "clickcount",
        reverse: "true",
      });

      const res = await fetch(`${RADIO_BROWSER_URL}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch radio stations");
      
      const data = await res.json();
      
      // Clean and parse lat/lng ensuring they are valid numbers
      return data
        .map((station: any) => ({
          ...station,
          geo_lat: parseFloat(station.geo_lat),
          geo_long: parseFloat(station.geo_long),
        }))
        .filter((station: RadioStation) => 
          !isNaN(station.geo_lat as number) && 
          !isNaN(station.geo_long as number)
        );
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}
