"use client";

import React, { useState } from 'react';
import { Input } from './input';
import { Label } from './label';

interface LocationInputProps {
  onLocationChange: (location: string, coords?: GeolocationCoordinates) => void;
}

export default function LocationInput({ onLocationChange }: LocationInputProps) {
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Staðsetning er ekki studd í þessum vafra');
      return;
    }

    setIsLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address from coordinates
          // For now, we'll use a simple format with coordinates
          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setLocation(locationString);
          onLocationChange(locationString, position.coords);
          setIsLoading(false);
        } catch (err) {
          console.error('Error getting location:', err);
          setError('Villa við að sækja staðsetningu');
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Gat ekki fundið staðsetningu. Vinsamlegast sláðu inn handvirkt.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    onLocationChange(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="location">Staðsetning bílsins</Label>
      <div className="flex gap-2">
        <Input
          id="location"
          type="text"
          placeholder="Sláðu inn staðsetningu eða notaðu GPS"
          value={location}
          onChange={handleLocationChange}
          className="flex-1"
        />
        <button
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="px-4 py-2 themed-button rounded-md whitespace-nowrap"
        >
          {isLoading ? 'Sæki...' : 'GPS'}
        </button>
      </div>
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}