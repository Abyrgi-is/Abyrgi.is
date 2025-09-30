'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

// Fix for default markers in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface PickupLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: 'staff' | 'vehicle' | 'equipment';
}

interface MapComponentProps {
  userLocation: [number, number];
  pickupLocations: PickupLocation[];
}

// Component to handle routing
function RoutingMachine({ userLocation, pickupLocations }: { 
  userLocation: [number, number]; 
  pickupLocations: PickupLocation[] 
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof window === 'undefined') return;

    // Create waypoints (user location + pickup locations)
    const waypoints = [
      L.latLng(userLocation[0], userLocation[1]),
      ...pickupLocations.map(location => L.latLng(location.lat, location.lng))
    ];

    const routingControl = (L as any).Routing.control({
      waypoints,
      routeWhileDragging: true,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: '#2563eb', opacity: 0.8, weight: 5 }]
      },
      createMarker: function(i: number, waypoint: any, n: number) {
        const isStart = i === 0;
        const location = isStart ? null : pickupLocations[i - 1];
        
        // Custom icons for different types with distinct colors
        let iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
        
        if (isStart) {
          // Green marker for your location
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';
        } else if (location) {
          switch (location.type) {
            case 'staff':
              // Blue marker for staff
              iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
              break;
            case 'vehicle':
              // Red marker for vehicles
              iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
              break;
            case 'equipment':
              // Orange marker for equipment
              iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png';
              break;
          }
        }
        
        const marker = L.marker(waypoint.latLng, {
          draggable: false,
          icon: L.icon({
            iconUrl,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        });
        
        if (isStart) {
          marker.bindPopup('📍 Þín staðsetning');
        } else if (location) {
          marker.bindPopup(`${getTypeEmoji(location.type)} ${location.name}`);
        }
        
        return marker;
      },
      router: (L as any).Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      })
    }).addTo(map);

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, userLocation, pickupLocations]);

  return null;
}

function getTypeEmoji(type: string): string {
  switch (type) {
    case 'staff': return '👤';
    case 'vehicle': return '🚗';
    case 'equipment': return '📦';
    default: return '📍';
  }
}

export default function MapComponent({ userLocation, pickupLocations }: MapComponentProps) {
  return (
    <MapContainer
      center={userLocation}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User location marker */}
      <Marker position={userLocation}>
        <Popup>📍 Þín staðsetning</Popup>
      </Marker>
      
      {/* Pickup location markers */}
      {pickupLocations.map((location) => (
        <Marker key={location.id} position={[location.lat, location.lng]}>
          <Popup>
            <div className="text-center">
              <strong>{getTypeEmoji(location.type)} {location.name}</strong>
              <br />
              <small>Tegund: {location.type === 'staff' ? 'Starfsmaður' : location.type === 'vehicle' ? 'Farartæki' : 'Búnaður'}</small>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Routing component */}
      <RoutingMachine 
        userLocation={userLocation} 
        pickupLocations={pickupLocations} 
      />
    </MapContainer>
  );
}