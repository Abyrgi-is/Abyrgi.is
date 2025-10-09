"use client";

import { RoleGuard } from '@/components/auth';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabaseClient } from '@/utils/supabase/supabase-library';

// Dynamically import the map component to avoid SSR issues
const StaffDropoffMap = dynamic(
    () => import('@/components/ui/StaffDropoffMap'),
    { 
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading map...</p>
                </div>
            </div>
        )
    }
);

interface Order {
    order_id: string;
    user_id: string;
    pickup_location?: {
        location_id: string;
        name: string;
        address: string;
        latitude: number;
        longitude: number;
    };
    dropoff_location?: {
        location_id: string;
        name: string;
        address: string;
        latitude: number;
        longitude: number;
    };
    car?: {
        make: string;
        model: string;
        plate: string;
    };
    status: string;
    notes?: string;
}

function DropoffPageContent() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [staffLocation, setStaffLocation] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get staff current location
    useEffect(() => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setStaffLocation([position.coords.latitude, position.coords.longitude]);
                },
                (err) => {
                    // Handle different geolocation errors
                    const errorMessages: Record<number, string> = {
                        1: 'Location permission denied',
                        2: 'Location unavailable',
                        3: 'Location request timeout'
                    };
                    // console.warn(`Geolocation error (${err.code}): ${errorMessages[err.code] || 'Unknown error'}. Using default location (Reykjavik).`);
                    // Default to Reykjavik if location is denied
                    setStaffLocation([64.1466, -21.9426]);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            // console.warn('Geolocation not available. Using default location (Reykjavik).');
            // Default location (Reykjavik)
            setStaffLocation([64.1466, -21.9426]);
        }
    }, []);

    // Fetch all active orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                // Fetch all orders without status filter to show everything
                const { data, error } = await supabaseClient.getAllOrdersWithLocations('abyrgi');
                
                if (error) {
                    // console.error('Error fetching orders:', error);
                    setError(error.message);
                } else {
                    //console.log('All orders fetched from database:', data);
                    //console.log('Number of orders:', (data || []).length);
                    
                    // Log each order's status
                    (data || []).forEach(order => {
                        //console.log(`Order ${order.order_id}: status = ${order.status}`);
                    });
                    
                    // Filter out completed orders on the client side if needed
                    const activeOrders = (data || []).filter(order => 
                        order.status !== 'completed' && order.status !== 'cancelled'
                    );
                    
                    //console.log('Active orders after filtering:', activeOrders);
                    //console.log('Number of active orders:', activeOrders.length);
                    
                    setOrders(activeOrders);
                }
            } catch (err) {
                // console.error('Error fetching orders:', err);
                setError('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading || !staffLocation) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading map...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center text-red-600">
                    <p className="text-xl font-bold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col">
            <div className="bg-white border-b p-4">
                <h1 className="text-2xl font-bold">Staff Drop-off Map</h1>
                <p className="text-gray-600">
                    {orders.length} active {orders.length === 1 ? 'order' : 'orders'}
                </p>
            </div>
            
            <div className="flex-1 relative">
                <StaffDropoffMap staffLocation={staffLocation} orders={orders} />
                
                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
                    <h3 className="font-bold mb-2">Legend</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Your Location</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span>Pickup Location</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>Dropoff Location</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DropoffPage() {
    return (
        <RoleGuard requiredRoles={['staff', 'driver']} redirectTo="/dropoff">
            <DropoffPageContent />
        </RoleGuard>
    );
}