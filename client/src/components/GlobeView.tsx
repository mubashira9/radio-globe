import { useEffect, useRef, useState, useMemo } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import type { RadioStation } from "../types/radio";

interface GlobeViewProps {
  stations: RadioStation[];
  activeStation: RadioStation | null;
  onStationClick: (station: RadioStation) => void;
}

export function GlobeView({ stations, activeStation, onStationClick }: GlobeViewProps) {
  const globeEl = useRef<GlobeMethods>();
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set initial camera position
  useEffect(() => {
    if (mounted && globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      globeEl.current.pointOfView({ altitude: 2.5 }, 2000);
    }
  }, [mounted]);

  // Focus on active station
  useEffect(() => {
    if (activeStation && globeEl.current && activeStation.geo_lat && activeStation.geo_long) {
      globeEl.current.controls().autoRotate = false;
      globeEl.current.pointOfView({
        lat: activeStation.geo_lat,
        lng: activeStation.geo_long,
        altitude: 1.2
      }, 1000);
    }
  }, [activeStation]);

  const pointsData = useMemo(() => {
    return stations.map(station => ({
      lat: station.geo_lat as number,
      lng: station.geo_long as number,
      size: activeStation?.stationuuid === station.stationuuid ? 1.5 : 0.5,
      color: activeStation?.stationuuid === station.stationuuid ? '#ff0055' : '#00f0ff',
      station
    }));
  }, [stations, activeStation]);

  if (!mounted) return <div className="absolute inset-0 bg-background" />;

  return (
    <div className="absolute inset-0 cursor-move">
      <Globe
        ref={globeEl as any}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={d => (d as any).size * 0.05}
        pointRadius={d => (d as any).size}
        pointsMerge={false}
        onPointClick={(point) => onStationClick((point as any).station)}
        pointResolution={32}
        animateIn={true}
      />
      {/* Atmosphere glow overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(9,9,11,0.8)_100%)]" />
    </div>
  );
}
