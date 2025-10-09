"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

interface Marker {
    position: [number, number];
    popup?: string;
}

interface MapProps {
    markers?: Marker[];
    onMapClick?: (lat: number, lng: number) => void;
    clickableMarker?: [number, number] | null;
    center?: [number, number];
    zoom?: number;
    height?: string;
}

const Map = ({ 
    markers = [], 
    onMapClick, 
    clickableMarker,
    center = [64.1355, -21.8954],
    zoom = 13,
    height = "500px"
}: MapProps) => {
    const mapRef = useRef<any>(null);
    const clickMarkerRef = useRef<any>(null);
    const [mapId] = useState(() => `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        const L = require("leaflet");

        // Fix for default markers in webpack
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Initialize the map only once
        if (!mapRef.current) {
            const map = L.map(mapId).setView(center, zoom);
            mapRef.current = map;

            // Add tile layer
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            // Add click event listener
            if (onMapClick) {
                map.on('click', (e: any) => {
                    const { lat, lng } = e.latlng;
                    onMapClick(lat, lng);
                });
            }
        }

        // Add static markers
        markers.forEach(({ position, popup }) => {
            const marker = L.marker(position).addTo(mapRef.current);
            if (popup) {
                marker.bindPopup(popup);
            }
        });

        // Add/update clickable marker
        if (clickableMarker) {
            if (clickMarkerRef.current) {
                clickMarkerRef.current.setLatLng(clickableMarker);
            } else {
                clickMarkerRef.current = L.marker(clickableMarker, {
                    draggable: true
                }).addTo(mapRef.current);
                
                // Handle marker drag
                clickMarkerRef.current.on('dragend', (e: any) => {
                    const { lat, lng } = e.target.getLatLng();
                    if (onMapClick) {
                        onMapClick(lat, lng);
                    }
                });
            }
        } else if (clickMarkerRef.current) {
            mapRef.current.removeLayer(clickMarkerRef.current);
            clickMarkerRef.current = null;
        }

    }, [markers, clickableMarker, onMapClick, isClient]);

    if (!isClient) {
        return <div style={{ height, width: "100%", borderRadius: "8px", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p>Loading map...</p>
        </div>;
    }

    return <div id={mapId} style={{ height, width: "100%", borderRadius: "8px" }}></div>;
};

export default Map;