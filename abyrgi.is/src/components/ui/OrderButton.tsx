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

            // Get booking data from localStorage
            const bookingDataStr = localStorage.getItem('bookingData');
            if (!bookingDataStr) {
                setError("No booking data found. Please start over.");
                setIsSubmitting(false);
                return;
            }

            const bookingData = JSON.parse(bookingDataStr);
            
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

            // Validate required data
            if (!bookingData.selectedCar?.id) {
                setError("No car selected. Please select a car.");
                setIsSubmitting(false);
                return;
            }

            // Submit booking to database
            const { data, error: bookingError } = await supabaseClient.placeBooking({
                user_id: user.id,
                car_id: bookingData.selectedCar.id,
                pickup_location: bookingData.location || `${latitude}, ${longitude}`,
                pickup_latitude: latitude,
                pickup_longitude: longitude,
                status: 'pending',
            });

            if (bookingError) {
                console.error("Booking error:", bookingError);
                setError(`Failed to place booking: ${bookingError.message}`);
                setIsSubmitting(false);
                return;
            }

            console.log("Booking placed successfully:", data);
            
            // Clear booking data from localStorage
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
