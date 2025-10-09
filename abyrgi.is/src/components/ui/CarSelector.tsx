"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Label } from './label';
import { supabaseClient } from '@/utils/supabase/supabase-library';

interface Car {
  id: string;
  make: string;
  model: string;
  color: string;
  licensePlate: string;
  year: number;
}

interface CarSelectorProps {
  onCarSelect: (car: Car) => void;
}

export default function CarSelector({ onCarSelect }: CarSelectorProps) {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { user, error: userError } = await supabaseClient.getCurrentUser();
      if (userError || !user) {
        setError("No authenticated user. Please sign in.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabaseClient.getCarsByUser(
        user.id,
        "abyrgi",
        { table: "cars" }
      );

      if (error) {
        setError(error.message);
      } else {
        // Normalize the data to match our Car interface
        const normalizedCars = (data as any[])?.map((car: any) => ({
          id: car.car_id || car.id, // Use car_id from DB or fallback to id
          make: car.car_make || car.make,
          model: car.car_model || car.model,
          color: car.color,
          licensePlate: car.plate || car.licensePlate,
          year: car.car_model_year || car.year,
          // Keep original data for compatibility
          ...car
        })) ?? [];
        
        setCars(normalizedCars);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error while fetching cars");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleCarSelect = (car: Car) => {
    setSelectedCar(car);
    onCarSelect(car);
  };

  return (
    <div className="space-y-4">
      <Label>Veldu bíl</Label>
      
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <div className="grid gap-3">
          {cars.map((car: Car) => (
            <div
              key={car.id}
              onClick={() => handleCarSelect(car)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedCar?.id === car.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 style={{ color: selectedCar?.id === car.id ? 'gray' : 'inherit' }} className="font-semibold text-lg text-gray-500 dark:text-gray-500">
                    {car.make} {car.model}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">{car.color} • {car.year}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg text-gray-500 dark:text-gray-500">{car.licensePlate}</p>
                  {selectedCar?.id === car.id && (
                    <span className="inline-block w-4 h-4 bg-blue-600 rounded-full mt-1"></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && !error && cars.length === 0 && (
        <p className="text-gray-600 dark:text-gray-300 text-center py-8">
          Þú hefur ekki skráða bíla. Farðu í stillingar til að bæta við bíl.
        </p>
      )}
    </div>
  );
}