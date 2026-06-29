"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  heatmapData: any;
  zones: any;
}

function getAqiColor(aqi: number) {
  if (aqi <= 50) return '#10b981'; // Green
  if (aqi <= 100) return '#eab308'; // Yellow
  if (aqi <= 150) return '#f97316'; // Orange
  if (aqi <= 200) return '#ef4444'; // Red
  return '#a855f7'; // Purple
}

export default function LeafletMap({ heatmapData, zones }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const zonesLayerRef = useRef<L.GeoJSON | null>(null);

  // 1. Initialize map container once
  useEffect(() => {
    const container = document.getElementById('leaflet-map-container');
    if (!container) return;

    // Center of India initially, Zoom level 5
    const map = L.map('leaflet-map-container', {
      zoomControl: false,
      zoomAnimation: false,         // Disable zoom animation to prevent unmount timing crashes
      fadeAnimation: false,         // Disable tile fade animation
      markerZoomAnimation: false    // Disable marker zoom animation
    }).setView([20.5937, 78.9629], 5);

    // Add custom zoom control to bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Add CartoDB Dark Matter tiles (premium dark mode matching zinc theme)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Load and update zones dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (zonesLayerRef.current) {
      map.removeLayer(zonesLayerRef.current);
      zonesLayerRef.current = null;
    }

    if (zones) {
      const layer = L.geoJSON(zones, {
        style: {
          color: '#3f3f46',
          weight: 1.5,
          fillColor: '#27272a',
          fillOpacity: 0.15,
          dashArray: '4, 4'
        }
      }).addTo(map);
      zonesLayerRef.current = layer;
    }
  }, [zones]);

  // 3. Load and update heatmap marker points dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    if (heatmapData) {
      const layer = L.geoJSON(heatmapData, {
        pointToLayer: (feature, latlng) => {
          const aqi = feature.properties?.aqi || 100;
          const color = getAqiColor(aqi);
          const name = feature.properties?.name || feature.properties?.stationName || 'Monitoring Node';
          
          return L.circleMarker(latlng, {
            radius: Math.max(8, Math.min(20, aqi / 15)),
            fillColor: color,
            color: color,
            weight: 1.5,
            opacity: 0.3,
            fillOpacity: 0.55
          }).bindPopup(`
            <div style="color: #ffffff; background-color: #18181b; border: 1px solid #27272a; border-radius: 6px; padding: 8px; font-family: sans-serif; font-size: 11px; line-height: 1.4;">
              <strong style="font-size: 12px; display: block; margin-bottom: 4px; color: #f4f4f5;">${name}</strong>
              <span style="font-weight: 700; color: ${color}; font-size: 13px;">AQI: ${aqi}</span>
            </div>
          `);
        }
      }).addTo(map);
      geoJsonLayerRef.current = layer;

      // Fit bounds to show the points dynamically
      if (heatmapData.features && heatmapData.features.length > 0) {
        try {
          const bounds = layer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: false });
          }
        } catch (e) {
          console.error('Error fitting bounds:', e);
        }
      }
    }
  }, [heatmapData]);

  return (
    <div className="relative h-full w-full">
      <div id="leaflet-map-container" className="h-full w-full rounded-xl bg-zinc-950" />
      
      {/* Custom Popup Style Override */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: #18181b !important;
          border: 1px solid #27272a !important;
          color: #f4f4f5 !important;
          border-radius: 8px !important;
          padding: 0 !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-popup-tip {
          background: #18181b !important;
          border-left: 1px solid #27272a !important;
          border-bottom: 1px solid #27272a !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
