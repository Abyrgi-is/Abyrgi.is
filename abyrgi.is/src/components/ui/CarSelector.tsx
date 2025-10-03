"use client";

import React, { useState } from 'react';
import { Label } from './label';

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

// Simulate user's cars - in a real app this would come from a database/API
const userCars: Car[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Corolla',
    color: 'Hvítur',
    licensePlate: 'ABC123',
    year: 2020,
  },
  {
    id: '2',
    make: 'Volkswagen',
    model: 'Golf',
    color: 'Blár',
    licensePlate: 'DEF456',
    year: 2019,
  },
  {
    id: '3',
    make: 'BMW',
    model: 'X3',
    color: 'Svartur',
    licensePlate: 'GHI789',
    year: 2021,
  },
];

export default function CarSelector({ onCarSelect }: CarSelectorProps) {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  const handleCarSelect = (car: Car) => {
    setSelectedCar(car);
    onCarSelect(car);
  };

  return (
    <div className="space-y-4">
      <Label>Veldu bíl</Label>
      <div className="grid gap-3">
        {userCars.map((car) => (
          <div
            key={car.id}
            onClick={() => handleCarSelect(car)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedCar?.id === car.id
                ? 'border-primary bg-primary/10'
                : 'border-primary/20 hover:border-primary/30'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  {car.make} {car.model}
                </h3>
                <p className="opacity-70">{car.color} • {car.year}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg">{car.licensePlate}</p>
                {selectedCar?.id === car.id && (
                  <span className="inline-block w-4 h-4 bg-primary rounded-full mt-1"></span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {userCars.length === 0 && (
        <p className="opacity-70 text-center py-8">
          Þú hefur ekki skráða bíla. Farðu í stillingar til að bæta við bíl.
        </p>
      )}
    </div>
  );
}