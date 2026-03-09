import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Heart, RadioReceiver } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { RadioStation } from "../types/radio";
import { useFavorites, useAddFavorite, useRemoveFavorite } from "../hooks/use-favorites";

interface PlayerProps {
  station: RadioStation | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  volume: number;
  onVolumeChange: (val: number) => void;
}

export function Player({ station, isPlaying, onTogglePlay, volume, onVolumeChange }: PlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  
  const { data: favorites = [] } = useFavorites();
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();

  const favoriteRecord = favorites.find(f => f.stationUuid === station?.stationuuid);
  const isFavorite = !!favoriteRecord;

  const handleFavoriteToggle = () => {
    if (!station) return;
    
    if (isFavorite) {
      removeFav.mutate(favoriteRecord.id);
    } else {
      addFav.mutate({
        stationUuid: station.stationuuid,
        name: station.name,
        streamUrl: station.url_resolved,
        country: station.country || "Unknown",
        favicon: station.favicon || "",
        tags: station.tags || "",
      });
    }
  };

  if (!station) return null;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 sm:bottom-8 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[600px] z-50"
    >
      <div className="glass-panel neon-border rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 group transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)]">
        
        {/* Station Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
            {station.favicon ? (
              <img 
                src={station.favicon} 
                alt={station.name} 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <RadioReceiver className="w-6 h-6 text-primary" />
            )}
            
            <AnimatePresence>
              {isPlaying && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1 backdrop-blur-[2px]"
                >
                  <div className="w-1 bg-primary eq-bar rounded-full" />
                  <div className="w-1 bg-primary eq-bar rounded-full" />
                  <div className="w-1 bg-primary eq-bar rounded-full" />
                  <div className="w-1 bg-primary eq-bar rounded-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-foreground font-display font-bold text-lg truncate pr-4 neon-text">
              {station.name || "Unknown Station"}
            </h3>
            <p className="text-muted-foreground text-sm truncate uppercase tracking-wider font-semibold">
              {station.country || "Global"} • {station.tags?.split(',')[0] || "Radio"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={handleFavoriteToggle}
            className={`p-2 rounded-full transition-all duration-300 ${
              isFavorite 
                ? 'text-secondary bg-secondary/10 shadow-[0_0_15px_rgba(255,0,85,0.3)]' 
                : 'text-muted-foreground hover:text-white hover:bg-white/10'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                onVolumeChange(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-20 sm:w-24 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary)) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%)`
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
