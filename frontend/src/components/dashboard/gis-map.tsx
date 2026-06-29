"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Station {
  id: string;
  stationCode: string;
  stationName: string;
  city: string;
  latitude: number;
  longitude: number;
  latestReading?: {
    aqi: number;
    category?: string;
  } | null;
}

interface Hotspot {
  latitude: number;
  longitude: number;
  aqi: number;
  severity: string;
  radius: number;
}

interface GisMapProps {
  stations: Station[];
  hotspots: Hotspot[];
  selectedCity: string;
}

export default function GisMap({ stations, hotspots, selectedCity }: GisMapProps) {
  // Fix Leaflet icon path issues
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Center map based on selected city
  const getCityCoordinates = (city: string): [number, number] => {
    const coords: Record<string, [number, number]> = {
      Delhi: [28.6139, 77.2090],
      Mumbai: [19.0760, 72.8777],
      Ahmedabad: [23.0225, 72.5714],
      Vadodara: [22.3072, 73.1812],
      Morbi: [22.8120, 70.8236],
      Bharuch: [21.7051, 72.9959],
      Silchar: [24.8333, 92.7789],
      Vapi: [20.3717, 72.9100],
    };
    return coords[city] || [23.0225, 72.5714];
  };

  const center = getCityCoordinates(selectedCity);

  // Helper to get AQI color
  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981'; // Emerald
    if (aqi <= 100) return '#84cc16'; // Lime
    if (aqi <= 200) return '#f59e0b'; // Amber
    if (aqi <= 300) return '#f97316'; // Orange
    if (aqi <= 400) return '#ef4444'; // Red
    return '#a855f7'; // Purple
  };

  // Create a premium pulsing div icon for stations
  const createStationIcon = (aqi: number) => {
    const color = getAqiColor(aqi);
    return L.divIcon({
      html: `
        <div class="relative flex h-5 w-5 items-center justify-center">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style="background-color: ${color}"></span>
          <span class="relative inline-flex h-3 w-3 rounded-full border border-zinc-950 shadow-md" style="background-color: ${color}"></span>
        </div>
      `,
      className: 'custom-station-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-zinc-800/80 shadow-2xl relative">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full z-10 bg-zinc-950"
        key={`${center[0]}-${center[1]}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Stations Markers */}
        {stations.map((station) => {
          const aqi = station.latestReading?.aqi || 100;
          return (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={createStationIcon(aqi)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 text-zinc-200 bg-zinc-950 rounded border border-zinc-800 text-xs">
                  <h4 className="font-bold text-zinc-100">{station.stationName}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Code: {station.stationCode}</p>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800">
                    <span className="font-semibold">AQI:</span>
                    <span
                      className="font-black px-1.5 py-0.5 rounded text-[10px]"
                      style={{
                        backgroundColor: `${getAqiColor(aqi)}20`,
                        color: getAqiColor(aqi),
                      }}
                    >
                      {aqi}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Hotspot Circles */}
        {hotspots.map((hotspot, idx) => {
          const color = hotspot.severity === 'CRITICAL' ? '#ef4444' : '#f97316';
          return (
            <React.Fragment key={idx}>
              <Circle
                center={[hotspot.latitude, hotspot.longitude]}
                radius={hotspot.radius * 1000} // Radius in meters
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.15,
                  weight: 1.5,
                  dashArray: '4,4',
                }}
              />
              <Marker
                position={[hotspot.latitude, hotspot.longitude]}
                icon={L.divIcon({
                  html: `
                    <div class="relative flex h-6 w-6 items-center justify-center">
                      <span class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 bg-red-500"></span>
                      <div class="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 border border-red-400 shadow-lg">
                        <span class="text-[8px] font-black text-white">!</span>
                      </div>
                    </div>
                  `,
                  className: 'custom-hotspot-icon',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                })}
              >
                <Popup>
                  <div className="p-2 text-zinc-200 bg-zinc-950 rounded border border-zinc-800 text-xs">
                    <h4 className="font-bold text-red-400">🚨 Active Hotspot</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Severity: {hotspot.severity}</p>
                    <p className="text-[10px] text-zinc-400">Radius: {hotspot.radius} km</p>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800">
                      <span className="font-semibold">Average AQI:</span>
                      <span className="font-bold text-red-400">{Math.round(hotspot.aqi)}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
