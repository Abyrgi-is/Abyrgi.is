"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./map'), {
    ssr: false,
    loading: () => <div style={{ height: "400px", width: "100%", borderRadius: "8px", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading map...</p>
    </div>
});

interface LocationMapProps {
    onLocationSelect: (lat: number, lng: number) => void;
    selectedLocation?: [number, number] | null;
}

const LocationMap: React.FC<LocationMapProps> = ({ onLocationSelect, selectedLocation }) => {
    const handleMapClick = (lat: number, lng: number) => {
        onLocationSelect(lat, lng);
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-medium mb-2">
                    Veldu staðsetningu á kortinu
                </h3>
                <p className="text-sm opacity-70 mb-4">
                    Smelltu á kortið til að velja staðsetningu eða dragðu merkið til að breyta
                </p>
            </div>
            
            <div className="border border-primary/20 rounded-lg overflow-hidden shadow-sm">
                <Map
                    onMapClick={handleMapClick}
                    clickableMarker={selectedLocation}
                    center={[64.1355, -21.8954]} // Reykjavik center
                    zoom={11}
                    height="400px"
                />
            </div>
            
            {selectedLocation && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="text-sm font-medium">
                        <span className="font-medium">Valin staðsetning:</span> {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default LocationMap;