"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import OrderButton from "@/components/ui/OrderButton";
import Map from "@/components/ui/map";
import { useState, useEffect } from "react";

interface Car {
  id: string;
  make: string;
  model: string;
  color: string;
  licensePlate: string;
  year: number;
  // Database field names for compatibility
  car_id?: string;
  car_make?: string;
  car_model?: string;
  car_model_year?: number;
  plate?: string;
}

interface BookingData {
  location: string;
  coordinates: any;
  mapLocation: [number, number] | null;
  selectedCar: Car;
  timestamp: string;
}

export default function BorgaPage() {
    const [bookingData, setBookingData] = useState<BookingData | null>(null);

    useEffect(() => {
        // Try to get booking data from localStorage or sessionStorage
        const savedBookingData = localStorage.getItem('bookingData');
        if (savedBookingData) {
            setBookingData(JSON.parse(savedBookingData));
        }
    }, []);

    // Show loading or no data state if bookingData is not available
    if (!bookingData) {
        return (
            <AuthGuard redirectTo="/borga">
                <div className="max-w-2xl mx-auto p-6 space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Borga
                        </h1>
                        <p className="text-gray-600">
                            Engin pöntunargögn fundust. Vinsamlegast farðu til baka og veldu bíl.
                        </p>
                        <a href="/pickup" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Til baka
                        </a>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    return (
         <AuthGuard redirectTo="/borga">
        
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-100 mb-2">
                    Borga
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Farðu yfir pöntunina þína og borgaðu
                </p>
            </div>

            {/* Selected Car Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Valinn bíll</h2>
                <div className="border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                {bookingData.selectedCar.make || bookingData.selectedCar.car_make} {bookingData.selectedCar.model || bookingData.selectedCar.car_model}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                {bookingData.selectedCar.color} • {bookingData.selectedCar.year || bookingData.selectedCar.car_model_year}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-lg text-gray-900 dark:text-gray-100">{bookingData.selectedCar.licensePlate || bookingData.selectedCar.plate}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Staðsetning</h2>
                <p className="text-gray-700 dark:text-gray-200">{bookingData.location}</p>
                {bookingData.mapLocation && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Coordinates: {bookingData.mapLocation[0].toFixed(6)}, {bookingData.mapLocation[1].toFixed(6)}
                    </p>
                )}
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Verðlag</h2>
                <div className="text-lg text-gray-700 space-y-2">
                    <p>Verð start gjald: <span className="font-semibold">1000kr</span></p>
                    <p>Km verð: <span className="font-semibold">250kr</span></p>
                    <p className="text-sm text-gray-500">
                        (Þetta er ekki alvöru borga, bara ýta á takkann og halda áfram)
                    </p>
                </div>
            </div>

            {/* Payment Button */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-center">
                    <OrderButton />
                </div>
            </div>
        </div>
        </AuthGuard>
    );
}
