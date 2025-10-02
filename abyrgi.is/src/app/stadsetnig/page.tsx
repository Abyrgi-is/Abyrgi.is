"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/utils/supabase/supabase-library';
import LocationInput from '@/components/ui/LocationInput';
import CarSelector from '@/components/ui/CarSelector';
import ContinueButton from '@/components/ui/ContinueButton';
import LocationMap from '@/components/ui/LocationMap';


interface Car {
  id: string;
  make: string;
  model: string;
  color: string;
  licensePlate: string;
  year: number;
}

export default function StadsetnigPage() {
  const [location, setLocation] = useState('');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null);
  const [mapLocation, setMapLocation] = useState<[number, number] | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      const { user, error } = await supabaseClient.getCurrentUser();
      
      if (!user && isMounted) {
        router.replace("/sign_in?redirect=/stadsetnig");
      } else if (isMounted) {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
    
    return () => { 
      isMounted = false; 
    };
  }, [router]);

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  const handleLocationChange = (location: string, coords?: GeolocationCoordinates) => {
    setLocation(location);
    if (coords) {
      setCoordinates(coords);
      setMapLocation([coords.latitude, coords.longitude]);
    }
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setMapLocation([lat, lng]);
    // Update location text with coordinates
    setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    
    // Create a mock coordinates object for consistency
    const mockCoords = {
      latitude: lat,
      longitude: lng,
      accuracy: 0,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null
    } as GeolocationCoordinates;
    setCoordinates(mockCoords);
  };

  const handleCarSelect = (car: Car) => {
    setSelectedCar(car);
  };

  const isFormValid = (location.trim() !== '' || mapLocation !== null) && selectedCar !== null;

  const handleContinue = () => {
    if (isFormValid) {
      // Store data in localStorage or pass to next page
      const bookingData = {
        location,
        coordinates,
        mapLocation,
        selectedCar,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('bookingData', JSON.stringify(bookingData));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Staðsetning og bíll
        </h1>
        <p className="text-gray-600">
          Veldu staðsetningu bílsins og hvaða bíl á að sækja
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <LocationInput onLocationChange={handleLocationChange} />
        
        <div className="border-t pt-6">
          <LocationMap 
            onLocationSelect={handleMapLocationSelect}
            selectedLocation={mapLocation}
          />
        </div>
        
        <div className="border-t pt-6">
          <CarSelector onCarSelect={handleCarSelect} />
        </div>

        <div className="border-t pt-6">
          <ContinueButton 
            disabled={!isFormValid} 
            onClick={handleContinue}
          />
        </div>
      </div>


    </div>
  );
}