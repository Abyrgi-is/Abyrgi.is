"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { supabaseClient } from "@/utils/supabase/supabase-library";

export default function OrderButton() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClick = async () => {
        console.log("Button clicked!");
        setIsSubmitting(true);
        setError(null);

        try {
            // Get current user
            const { user, error: userError } = await supabaseClient.getCurrentUser();
            if (userError || !user) {
                setError("No authenticated user. Please sign in.");
                setIsSubmitting(false);
                return;
            }

            // Get order data from localStorage
            const bookingDataStr = localStorage.getItem('bookingData'); // Keep 'bookingData' key for compatibility
            
            if (!bookingDataStr) {
                setError("No order data found. Please start over.");
                setIsSubmitting(false);
                return;
            }

            const bookingData = JSON.parse(bookingDataStr); // Keep variable name for compatibility
            
            // Extract coordinates from mapLocation or coordinates
            let latitude: number | null = null;
            let longitude: number | null = null;
            
            if (bookingData.mapLocation && Array.isArray(bookingData.mapLocation)) {
                latitude = bookingData.mapLocation[0];
                longitude = bookingData.mapLocation[1];
            } else if (bookingData.coordinates) {
                latitude = bookingData.coordinates.latitude;
                longitude = bookingData.coordinates.longitude;
            }

            // Validate required data - check for both id and car_id fields
            const carId = bookingData.selectedCar?.id || bookingData.selectedCar?.car_id;
            
            if (!carId) {
                setError("No car selected. Please select a car.");
                setIsSubmitting(false);
                return;
            }

            // First create a location record for pickup
            const locationName = bookingData.location || `Pickup Location`;
            const locationAddress = bookingData.location || `${latitude}, ${longitude}`;
            
            const { data: pickupLocation, error: locationError } = await supabaseClient.createLocation({
                name: locationName,
                address: locationAddress,
                latitude: latitude || 0,
                longitude: longitude || 0,
                user_id: user.id,
            });

            if (locationError) {
                console.error("Location creation error:", locationError);
                setError(`Failed to create pickup location: ${locationError.message}`);
                setIsSubmitting(false);
                return;
            }

            // For dropoff, we'll create a simple "Car Location" or reuse pickup location
            const { data: dropoffLocation, error: dropoffLocationError } = await supabaseClient.createLocation({
                name: "Dropoff Location",
                address: locationAddress, // Same as pickup for now
                latitude: latitude || 0,
                longitude: longitude || 0,
                user_id: user.id,
            });

            if (dropoffLocationError) {
                console.error("Dropoff location creation error:", dropoffLocationError);
                setError(`Failed to create dropoff location: ${dropoffLocationError.message}`);
                setIsSubmitting(false);
                return;
            }

            // Now submit order to database using the location UUIDs
            const { data, error: orderError } = await supabaseClient.placeOrder({
                user_id: user.id,
                pickup_location_id: pickupLocation.location_id,
                dropoff_location_id: dropoffLocation.location_id,
                car_id: carId,
                status: 'pending',
                notes: `Pickup: ${locationName}, Car: ${carId}`,
            });

            if (orderError) {
                console.error("Order error:", orderError);
                console.error("Full order error details:", JSON.stringify(orderError, null, 2));
                
                // Check if it's a 404 error (table not found)
                const errorMessage = orderError.message || 'Unknown database error';
                const is404Error = errorMessage.includes('404') || errorMessage.includes('Not Found') || !orderError.message;
                
                if (is404Error) {
                    setError(`Database table 'orders' not found. Please create the orders table in your Supabase database.`);
                } else {
                    setError(`Failed to place order: ${errorMessage}`);
                }
                setIsSubmitting(false);
                return;
            }

            console.log("Order placed successfully:", data);
            
            // Clear order data from localStorage
            localStorage.removeItem('bookingData');
            
            // Navigate to order confirmation page
            router.push("/order");
        } catch (err) {
            console.error("Error placing booking:", err);
            setError(err instanceof Error ? err.message : "Unknown error occurred");
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <button
                style={{
                    backgroundColor: isSubmitting ? "#666" : "black",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    width: "200px",
                    height: "50px",
                    opacity: isSubmitting ? 0.7 : 1,
                }}
                onClick={handleClick}
                disabled={isSubmitting}
            >
                <span style={{ fontFamily: "Arial, sans-serif" }}>
                    {isSubmitting ? "Placing order..." : "Pay"}
                </span>
            </button>
            {error && (
                <div style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#fee",
                    border: "1px solid #fcc",
                    borderRadius: "4px",
                    color: "#c00",
                    fontSize: "14px",
                }}>
                    {error}
                </div>
            )}
        </div>
    );
}
