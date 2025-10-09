'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface Order {
    order_id: string;
    user_id: string;
    pickup_location?: {
        location_id: string;
        name: string;
        address: string;
        latitude: number;
        longitude: number;
    };
    dropoff_location?: {
        location_id: string;
        name: string;
        address: string;
        latitude: number;
        longitude: number;
    };
    car?: {
        make: string;
        model: string;
        plate: string;
    };
    status: string;
    notes?: string;
}

// Custom markers for different location types
const createCustomIcon = (color: string) => {
    const iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`;
    return L.icon({
        iconUrl,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const greenIcon = createCustomIcon('green');  // Staff location
const blueIcon = createCustomIcon('blue');    // Pickup location
const redIcon = createCustomIcon('red');      // Dropoff location

// Component to recenter map when staff location changes
function RecenterMap({ center }: { center: [number, number] }) {
    const map = useMap();
    
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    
    return null;
}

interface StaffDropoffMapProps {
    staffLocation: [number, number];
    orders: Order[];
}

export default function StaffDropoffMap({ staffLocation, orders }: StaffDropoffMapProps) {
    return (
        <MapContainer
            center={staffLocation}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <RecenterMap center={staffLocation} />
            
            {/* Staff location marker */}
            <Marker position={staffLocation} icon={greenIcon}>
                <Popup>
                    <div className="text-center">
                        <strong>📍 Your Location</strong>
                        <br />
                        <small>Staff member</small>
                    </div>
                </Popup>
            </Marker>
            
            {/* Pickup location markers */}
            {orders.map((order) => 
                order.pickup_location && (
                    <Marker 
                        key={`pickup-${order.order_id}`} 
                        position={[order.pickup_location.latitude, order.pickup_location.longitude]}
                        icon={blueIcon}
                    >
                        <Popup>
                            <div className="text-left">
                                <strong className="text-blue-600">🚗 Pickup Location</strong>
                                <br />
                                <strong>{order.pickup_location.name}</strong>
                                <br />
                                {order.pickup_location.address && (
                                    <>
                                        <small>{order.pickup_location.address}</small>
                                        <br />
                                    </>
                                )}
                                {order.car && (
                                    <small>Car: {order.car.make} {order.car.model} ({order.car.plate})</small>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )
            )}
            
            {/* Dropoff location markers */}
            {orders.map((order) => 
                order.dropoff_location && (
                    <Marker 
                        key={`dropoff-${order.order_id}`} 
                        position={[order.dropoff_location.latitude, order.dropoff_location.longitude]}
                        icon={redIcon}
                    >
                        <Popup>
                            <div className="text-left">
                                <strong className="text-red-600">📍 Dropoff Location</strong>
                                <br />
                                <strong>{order.dropoff_location.name}</strong>
                                <br />
                                {order.dropoff_location.address && (
                                    <>
                                        <small>{order.dropoff_location.address}</small>
                                        <br />
                                    </>
                                )}
                                {order.car && (
                                    <small>Car: {order.car.make} {order.car.model} ({order.car.plate})</small>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )
            )}
        </MapContainer>
    );
}
