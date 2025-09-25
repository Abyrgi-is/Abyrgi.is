'use client';

import { useState, useEffect } from 'react';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  location: string;
}

interface NewCarData {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  location: string;
}

export default function CarManager() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCar, setNewCar] = useState<NewCarData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    location: ''
  });

  // Fetch cars from API
  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars');
      const data = await response.json();
      setCars(data.cars);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new car with optimistic update
  const addCar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCar),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Optimistic update - immediately add to UI
        setCars(prevCars => [...prevCars, data.car]);
        
        // Reset form
        setNewCar({
          make: '',
          model: '',
          year: new Date().getFullYear(),
          licensePlate: '',
          location: ''
        });
        setShowAddForm(false);
      } else {
        console.error('Failed to add car');
      }
    } catch (error) {
      console.error('Error adding car:', error);
    }
  };

  // Delete a car with optimistic update
  const deleteCar = async (id: string) => {
    // Optimistic update - immediately remove from UI
    setCars(prevCars => prevCars.filter(car => car.id !== id));
    
    try {
      const response = await fetch(`/api/cars?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        // If deletion failed, restore the car
        console.error('Failed to delete car');
        fetchCars(); // Refresh to restore the data
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      fetchCars(); // Refresh to restore the data
    }
  };

  // Initial load
  useEffect(() => {
    fetchCars();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading cars...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bílastjórnun - Car Management
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Car'}
        </button>
      </div>

      {/* Add car form */}
      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Car</h2>
          <form onSubmit={addCar} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Make</label>
              <input
                type="text"
                value={newCar.make}
                onChange={(e) => setNewCar({...newCar, make: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input
                type="text"
                value={newCar.model}
                onChange={(e) => setNewCar({...newCar, model: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input
                type="number"
                value={newCar.year}
                onChange={(e) => setNewCar({...newCar, year: parseInt(e.target.value)})}
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Plate</label>
              <input
                type="text"
                value={newCar.licensePlate}
                onChange={(e) => setNewCar({...newCar, licensePlate: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={newCar.location}
                onChange={(e) => setNewCar({...newCar, location: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Add Car
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cars list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div key={car.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {car.make} {car.model}
              </h3>
              <button
                onClick={() => deleteCar(car.id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title="Delete car"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div><span className="font-medium">Year:</span> {car.year}</div>
              <div><span className="font-medium">License Plate:</span> {car.licensePlate}</div>
              <div><span className="font-medium">Location:</span> {car.location}</div>
            </div>
          </div>
        ))}
      </div>

      {cars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No cars available. Add your first car above!
          </p>
        </div>
      )}
    </div>
  );
}