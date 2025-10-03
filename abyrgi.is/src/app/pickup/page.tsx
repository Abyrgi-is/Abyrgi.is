'use client';

import { useEffect, useState } from 'react';
import { RoleGuard } from '@/components/auth';
import dynamic from 'next/dynamic';

// Dynamically import the map component with no SSR
const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg">Hleður korti...</p>
      </div>
    </div>
  ),
}) as React.ComponentType<{
  userLocation: [number, number];
  pickupLocations: PickupLocation[];
}>;

interface PickupLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: 'staff' | 'vehicle' | 'equipment';
}

function PickupPageContent() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sample pickup locations in Reykjavik area - must be at top with other useState calls
  const [pickupLocations] = useState<PickupLocation[]>([
    { 
      id: 1, 
      name: 'Starfsmaður - Ásta', 
      lat: 64.1466, 
      lng: -21.9426, 
      type: 'staff' 
    },
    { 
      id: 2, 
      name: 'Starfsmaður - Björn', 
      lat: 64.1440, 
      lng: -21.9300, 
      type: 'staff' 
    },
    { 
      id: 3, 
      name: 'Bíll - Toyota Corolla', 
      lat: 64.1500, 
      lng: -21.9500, 
      type: 'vehicle' 
    },
    { 
      id: 4, 
      name: 'Búnaður - Cleaning Kit', 
      lat: 64.1400, 
      lng: -21.9200, 
      type: 'equipment' 
    }
  ]);

  useEffect(() => {
    // Get user's current location
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setIsLoading(false);
        },
        (error) => {
          console.error('Villa við að fá staðsetningu:', error);
          // Fallback to Reykjavik center
          setUserLocation([64.1466, -21.9426]);
          setError('Gat ekki fundið þína staðsetningu, notum miðbæ Reykjavíkur');
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000
        }
      );
    } else {
      // Fallback to Reykjavik center
      setUserLocation([64.1466, -21.9426]);
      setError('Staðsetningarþjónusta ekki í boði, notum miðbæ Reykjavíkur');
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Hleður korti...</p>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">Villa við að hlaða korti</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 themed-button rounded"
          >
            Reyna aftur
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white shadow-sm border-b p-4">
        <h1 className="text-2xl font-bold">Sækja - Leiðsögn</h1>
        {error && (
          <p className="text-amber-600 text-sm mt-1">{error}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-4 text-sm opacity-70">
          <span>� Starfsmenn</span>
          <span>📍 Þín staðsetning</span>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <DynamicMap 
          userLocation={userLocation} 
          pickupLocations={pickupLocations} 
        />
      </div>
      
      <div className="themed-card border-t p-4">
        <div className="flex justify-between items-center">
          <div className="text-sm opacity-70">
            {pickupLocations.length} staðir til að sækja
          </div>
          <button className="px-6 py-2 themed-button rounded-lg transition-colors">
            Byrja ferð
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PickupPage() {
  return (
    <RoleGuard requiredRoles="driver" redirectTo="/pickup">
      <PickupPageContent />
    </RoleGuard>
  );
}