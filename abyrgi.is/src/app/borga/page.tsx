"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LocationInput from "@/components/ui/LocationInput";

interface Car {
  id: string;
  make: string;
  model: string;
  color: string;
  licensePlate: string;
  year: number;
}

interface BookingData {
  location: string;
  coordinates: GeolocationCoordinates | null;
  mapLocation: [number, number] | null;
  selectedCar: Car | null;
  timestamp: string;
}

export default function BorgaPage() {
    const router = useRouter();
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [dropoffLocation, setDropoffLocation] = useState("");
    const [dropoffCoords, setDropoffCoords] = useState<GeolocationCoordinates | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // Load booking data from localStorage
        const stored = localStorage.getItem('bookingData');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                setBookingData(data);
            } catch (e) {
                console.error('Error parsing booking data:', e);
                setError('Gat ekki hlaðið bókunargögnum. Vinsamlegast byrjaðu aftur.');
            }
        } else {
            setError('Engin bókunargögn fundust. Vinsamlegast byrjaðu aftur.');
        }
    }, []);

    const handleDropoffLocationChange = (location: string, coords?: GeolocationCoordinates) => {
        setDropoffLocation(location);
        if (coords) {
            setDropoffCoords(coords);
        }
    };

    const handleSubmitOrder = async () => {
        if (!bookingData || !dropoffLocation) {
            setError('Vinsamlegast fylltu út alla reiti');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Prepare pickup location
            const pickupLocation = {
                lat: bookingData.mapLocation?.[0] || bookingData.coordinates?.latitude,
                lng: bookingData.mapLocation?.[1] || bookingData.coordinates?.longitude,
                address: bookingData.location,
                name: 'Pickup Location'
            };

            // Prepare dropoff location
            const dropoffLocationData = {
                lat: dropoffCoords?.latitude,
                lng: dropoffCoords?.longitude,
                address: dropoffLocation,
                name: 'Dropoff Location'
            };

            // Submit order to API
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pickupLocation,
                    dropoffLocation: dropoffLocationData,
                    carId: bookingData.selectedCar?.id,
                    notes: `Car: ${bookingData.selectedCar?.make} ${bookingData.selectedCar?.model} (${bookingData.selectedCar?.licensePlate})`
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create order');
            }

            // Clear localStorage and redirect to success page
            localStorage.removeItem('bookingData');
            router.push('/stadfesta');
        } catch (err) {
            console.error('Error submitting order:', err);
            setError(err instanceof Error ? err.message : 'Villa kom upp við að skrá pöntun');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (error && !bookingData) {
        return (
            <div className="p-6 bg-red-50 rounded-lg shadow-md">
                <p className="text-red-700">{error}</p>
                <button
                    onClick={() => router.push('/stadsetnig')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Fara til baka
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Greiðsla og staðfesting
                </h1>
            </div>

            {bookingData && (
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Upplýsingar um bókun</h3>
                        <p><strong>Bíll:</strong> {bookingData.selectedCar?.make} {bookingData.selectedCar?.model}</p>
                        <p><strong>Númeraplata:</strong> {bookingData.selectedCar?.licensePlate}</p>
                        <p><strong>Sækja frá:</strong> {bookingData.location}</p>
                    </div>

                    <div className="border-t pt-4">
                        <LocationInput onLocationChange={handleDropoffLocationChange} />
                        <p className="text-sm text-gray-600 mt-2">Sláðu inn hvar á að skila bílnum</p>
                    </div>

                    <div className="border-t pt-4">
                        <div className="text-lg text-gray-700 mb-4">
                            <p>Verð start gjald: <span className="font-semibold">1000kr</span></p>
                            <p>Km verð: <span className="font-semibold">250kr</span></p>
                            <p className="text-sm text-gray-500 mt-2">
                                (Þetta er alvöru borga, þetta virkar ekki í bara að ýtta á takkann)
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-center pt-4">
                        <button
                            onClick={handleSubmitOrder}
                            disabled={isSubmitting || !dropoffLocation}
                            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
                                isSubmitting || !dropoffLocation
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                            {isSubmitting ? 'Skráir pöntun...' : 'Staðfesta pöntun'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}