import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Globe2, Heart, Radio, Loader2 } from "lucide-react";
import type { RadioStation } from "../types/radio";
import { useFavorites } from "../hooks/use-favorites";

interface SidebarProps {
  stations: RadioStation[];
  isLoading: boolean;
  activeStation: RadioStation | null;
  onStationClick: (station: RadioStation) => void;
}

export function Sidebar({ stations, isLoading, activeStation, onStationClick }: SidebarProps) {
  const [tab, setTab] = useState<"discover" | "favorites">("discover");
  const [search, setSearch] = useState("");
  const { data: favorites = [], isLoading: favLoading } = useFavorites();

  const filteredStations = stations.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.country?.toLowerCase().includes(search.toLowerCase())
  );

  // Map backend favorites back to RadioStation interface for consistent rendering
  const mappedFavorites: RadioStation[] = favorites.map(f => ({
    stationuuid: f.stationUuid,
    name: f.name,
    url_resolved: f.streamUrl,
    favicon: f.favicon || "",
    tags: f.tags || "",
    country: f.country || "",
    geo_lat: null, // We don't store lat/lng in favs, so clicking them won't move globe, but will play
    geo_long: null,
    clickcount: 0
  }));

  const filteredFavorites = mappedFavorites.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const displayList = tab === "discover" ? filteredStations : filteredFavorites;

  return (
    <motion.div 
      initial={{ x: -400 }}
      animate={{ x: 0 }}
      className="absolute top-0 bottom-0 left-0 w-full sm:w-80 lg:w-96 glass-panel border-l-0 border-y-0 flex flex-col z-40 bg-black/60 pt-4"
    >
      <div className="px-6 pb-6">
        <h1 className="font-display text-4xl font-bold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2 uppercase drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">
          Radio Globe
        </h1>
        <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-6">
          Tune into the world
        </p>

        {/* Tabs */}
        <div className="flex bg-white/5 rounded-lg p-1 mb-6">
          <button
            onClick={() => setTab("discover")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === "discover" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white/80"
            }`}
          >
            <Globe2 className="w-4 h-4" /> Discover
          </button>
          <button
            onClick={() => setTab("favorites")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === "favorites" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white/80"
            }`}
          >
            <Heart className="w-4 h-4" /> Favorites
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {isLoading || (tab === "favorites" && favLoading) ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p className="font-semibold uppercase tracking-wide text-xs">Scanning frequencies...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center px-4">
            <Radio className="w-8 h-8 mb-4 opacity-50" />
            <p className="text-sm font-semibold">No stations found on this frequency.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {displayList.map((station) => (
              <button
                key={station.stationuuid}
                onClick={() => onStationClick(station)}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 text-left w-full group
                  ${activeStation?.stationuuid === station.stationuuid 
                    ? 'bg-primary/20 border border-primary/40 shadow-[inset_0_0_20px_rgba(0,240,255,0.1)]' 
                    : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
                  }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-black/50 flex items-center justify-center shrink-0 overflow-hidden border
                  ${activeStation?.stationuuid === station.stationuuid ? 'border-primary/50' : 'border-white/10'}
                `}>
                  {station.favicon ? (
                    <img 
                      src={station.favicon} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <Radio className={`w-5 h-5 ${activeStation?.stationuuid === station.stationuuid ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold truncate text-sm transition-colors ${
                    activeStation?.stationuuid === station.stationuuid ? 'text-white neon-text' : 'text-white/90 group-hover:text-white'
                  }`}>
                    {station.name || "Unknown"}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate uppercase tracking-wider font-semibold mt-0.5">
                    {station.country || "Global"}
                  </p>
                </div>

                {activeStation?.stationuuid === station.stationuuid && (
                  <div className="flex gap-[2px] pr-2">
                    <div className="w-1 bg-primary eq-bar rounded-full" />
                    <div className="w-1 bg-primary eq-bar rounded-full" />
                    <div className="w-1 bg-primary eq-bar rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
