import { useState, useRef, useEffect } from "react";
import { GlobeView } from "../components/GlobeView";
import { Player } from "../components/Player";
import { Sidebar } from "../components/Sidebar";
import { useTopStations } from "../hooks/use-radio-api";
import type { RadioStation } from "../types/radio";

export default function Home() {
  const { data: stations = [], isLoading } = useTopStations();
  
  const [activeStation, setActiveStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle playing station
  const handleStationClick = (station: RadioStation) => {
    setActiveStation(station);
    setIsPlaying(true);
  };

  // Sync audio element with state
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      // Handle buffering / errors gracefully
      audioRef.current.addEventListener('error', () => {
        console.error("Audio stream failed to load");
        setIsPlaying(false);
      });
      audioRef.current.addEventListener('playing', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
    }

    const audio = audioRef.current;
    
    if (activeStation) {
      // Don't restart if clicking the same station
      if (audio.src !== activeStation.url_resolved) {
        audio.src = activeStation.url_resolved;
        if (isPlaying) {
          audio.play().catch(e => {
            console.error("Autoplay prevented:", e);
            setIsPlaying(false);
          });
        }
      }
    }
    
    return () => {
      // Cleanup happens on unmount
    };
  }, [activeStation]);

  // Sync play/pause
  useEffect(() => {
    if (audioRef.current && activeStation) {
      if (isPlaying && audioRef.current.paused) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else if (!isPlaying && !audioRef.current.paused) {
        // For live radio, setting src to '' completely stops downloading
        // But for resume we'd need to re-set it. We will just pause for simplicity.
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeStation]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background flex">
      {/* 3D Visualizer */}
      <GlobeView 
        stations={stations} 
        activeStation={activeStation} 
        onStationClick={handleStationClick} 
      />

      {/* UI Overlay */}
      <Sidebar 
        stations={stations} 
        isLoading={isLoading}
        activeStation={activeStation}
        onStationClick={handleStationClick}
      />

      <Player 
        station={activeStation}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        volume={volume}
        onVolumeChange={setVolume}
      />
    </div>
  );
}
