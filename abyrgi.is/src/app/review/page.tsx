"use client";

import { AuthGuard } from '@/components/auth';
import { useState, useEffect } from 'react';
import { supabaseClient } from '@/utils/supabase/supabase-library';

interface Review {
    id: string;
    user_id: string;
    order_id: string;
    rating: number;
    created_at: string;
    // Display fields (joined from orders/cars)
    pickup_location?: string;
    dropoff_location?: string;
    driver_name?: string;
    car_info?: string;
}

interface OrderData {
    order_id: string;
    user_id: string;
    staff_id: string;
    car_id: string;
    pickup_location_id: string;
    dropoff_location_id: string;
    status: string;
    notes?: string;
    created_at: string;
    // Joined data for display
    pickup_location?: string;
    dropoff_location?: string;
    driver_name?: string;
    car_make?: string;
    car_model?: string;
    license_plate?: string;
}

function StarRating({ rating, onRatingChange, readonly = false }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
}) {
    const [hoveredRating, setHoveredRating] = useState(0);
    const stars = [1, 2, 3, 4, 5];
    
    return (
        <div className="flex space-x-1">
            {stars.map((star) => {
                const isActive = star <= (hoveredRating || rating);
                const isHovered = hoveredRating > 0 && star <= hoveredRating;
                
                return (
                    <button
                        key={star}
                        type="button"
                        className={`text-2xl transition-colors ${
                            isActive
                                ? isHovered 
                                    ? 'text-yellow-300 dark:text-yellow-200' 
                                    : 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                        } ${!readonly && onRatingChange ? 'cursor-pointer' : 'cursor-default'}`}
                        onClick={() => !readonly && onRatingChange && onRatingChange(star)}
                        onMouseEnter={() => !readonly && onRatingChange && setHoveredRating(star)}
                        onMouseLeave={() => !readonly && onRatingChange && setHoveredRating(0)}
                        disabled={readonly}
                    >
                        ★
                    </button>
                );
            })}
        </div>
    );
}

function ReviewCard({ review }: { review: Review }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <StarRating rating={review.rating} readonly />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            ({review.rating}/5)
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('is-IS')} • {new Date(review.created_at).toLocaleTimeString('is-IS', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
            
            {/* Trip Details */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Frá:</span>
                        <p className="text-gray-600 dark:text-gray-400">{review.pickup_location || 'Ekki skráð'}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Til:</span>
                        <p className="text-gray-600 dark:text-gray-400">{review.dropoff_location || 'Ekki skráð'}</p>
                    </div>
                    {review.driver_name && (
                        <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Ökumaður:</span>
                            <p className="text-gray-600 dark:text-gray-400">{review.driver_name}</p>
                        </div>
                    )}
                    {review.car_info && (
                        <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Bíll:</span>
                            <p className="text-gray-600 dark:text-gray-400">{review.car_info}</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Note: Comments are not stored in the reviews table */}
        </div>
    );
}

function ReviewPageContent() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [completedTrips, setCompletedTrips] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<OrderData | null>(null);
    const [formData, setFormData] = useState({
        rating: 0,
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchReviews();
        fetchCompletedTrips();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { user, error: userError } = await supabaseClient.getCurrentUser();
            if (userError || !user) return;

            // Fetch reviews for this user
            const { data: reviewsData, error } = await supabaseClient.fetchData('reviews', 'abyrgi');
            
            if (error) {
                if (error.message?.includes('404') || error.code === 'PGRST116') {
                    // Reviews table not found - starting with empty reviews
                    setReviews([]);
                } else {
                    // Handle review fetch error silently
                    setReviews([]);
                }
            } else {
                // Get orders data to join with reviews for display information (including archived)
                const { data: ordersData } = await supabaseClient.fetchData('orders', 'abyrgi');
                const { data: carsData } = await supabaseClient.fetchData('cars', 'abyrgi');
                const { data: carModelsData } = await supabaseClient.fetchData('car_models', 'abyrgi');
                
                // Filter reviews by current user and enrich with order data
                const userReviews = (reviewsData || [])
                    .filter((review: any) => review.user_id === user.id)
                    .map((review: any) => {
                        // Find the corresponding order
                        const order = ordersData?.find((o: any) => o.order_id === review.order_id);
                        
                        if (!order) {
                            return {
                                ...review,
                                pickup_location: 'Unknown Location',
                                dropoff_location: 'Unknown Location',
                                driver_name: 'Unknown Driver',
                                car_info: 'Unknown Car'
                            };
                        }

                        // Parse car info from order notes
                        let actualCarId = order.car_id;
                        let pickupCoords = null;
                        
                        if (order.notes) {
                            const carMatch = order.notes.match(/Car:\s*([a-f0-9-]+)/i);
                            const pickupMatch = order.notes.match(/Pickup:\s*([\d.-]+),\s*([\d.-]+)/i);
                            
                            if (carMatch) actualCarId = carMatch[1];
                            if (pickupMatch) {
                                pickupCoords = {
                                    lat: parseFloat(pickupMatch[1]),
                                    lng: parseFloat(pickupMatch[2])
                                };
                            }
                        }

                        // Find car and car model (using user's cars from getCarsByUser)
                        const car = carsData?.find((c: any) => c.car_id === actualCarId);
                        const carModel = car ? carModelsData?.find((cm: any) => cm.car_model_id === car.car_model_id) : null;

                        return {
                            ...review,
                            pickup_location: pickupCoords ? `${pickupCoords.lat.toFixed(4)}, ${pickupCoords.lng.toFixed(4)}` : 'Unknown Location',
                            dropoff_location: 'End Location', // You can enhance this with dropoff parsing if needed
                            driver_name: order.staff_id ? `Driver ${order.staff_id.slice(0, 8)}` : 'No Driver Assigned',
                            car_info: carModel ? `${carModel.make} ${carModel.model} (${car?.plate || 'Unknown Plate'})` : 'Unknown Car'
                        };
                    })
                    .sort((a: any, b: any) => 
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                    
                setReviews(userReviews);
            }
        } catch (error) {
            // Handle review fetch error
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompletedTrips = async () => {
        try {
            const { user, error: userError } = await supabaseClient.getCurrentUser();
            if (userError || !user) {
                console.log('No user found:', userError);
                return;
            }



            // Fetch completed orders for the current user
            const { data: orders, error } = await supabaseClient.fetchData('orders', 'abyrgi');
            
            if (error) {
                // Handle orders fetch error
                return;
            }



            // Auto-archive orders that are 'done' for more than 24 hours without review
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const ordersToArchive = (orders || []).filter((order: any) => 
                order.user_id === user.id && 
                order.status === 'done' &&
                new Date(order.created_at) < oneDayAgo
            );

            // Archive old completed orders
            for (const order of ordersToArchive) {
                const { error: archiveError } = await supabaseClient.updateRows('orders', { status: 'archived' }, { column: 'order_id', value: order.order_id }, 'abyrgi');
                if (archiveError) {
                    // Silently handle archive errors
                }
            }

            // Filter for DONE orders by this user (excluding archived ones)
            const userCompletedOrders = (orders || []).filter((order: any) => 
                order.user_id === user.id && 
                order.status === 'done'
            );



            // Get existing reviews to filter out already reviewed orders
            const { data: existingReviews } = await supabaseClient.fetchData('reviews', 'abyrgi');
            const reviewedOrderIds = new Set(
                (existingReviews || [])
                    .filter((review: any) => review.user_id === user.id)
                    .map((review: any) => review.order_id)
            );

            // Filter out orders that have already been reviewed
            const unreviewed = userCompletedOrders.filter((order: any) => 
                !reviewedOrderIds.has(order.order_id)
            );

            // Get all cars (needed to look up any car used in orders, not just user's cars)
            const { data: cars, error: carsError } = await supabaseClient.fetchData('cars', 'abyrgi');
            if (carsError) {
                // Handle car fetch error silently
            }

            // Get car models for make/model information
            const { data: carModels, error: carModelsError } = await supabaseClient.fetchData('car_models', 'abyrgi');
            if (carModelsError) {
                // Handle car models fetch error silently
            }

            // Get location details
            const { data: locations, error: locationsError } = await supabaseClient.fetchData('locations', 'abyrgi');
            if (locationsError) {
                // Handle location fetch error silently
            }

            // Note: users table is part of Supabase auth system, not accessible via regular queries
            // We'll get user info through user_roles and roles tables, or use placeholder data

            // We'll get role information as needed for individual staff members

            // Map orders with actual car, location, and staff data
            const formattedOrders: OrderData[] = unreviewed.map((order: any) => {

                
                // Parse notes to extract car ID and pickup coordinates
                let actualCarId = order.car_id;
                let pickupCoords = null;
                
                if (order.notes) {
                    // Example: "Pickup: 64.149914, -21.915238, Car: fc71f9dd-e882-4a9b-93bd-429885080164"
                    const carMatch = order.notes.match(/Car:\s*([a-f0-9-]+)/i);
                    const pickupMatch = order.notes.match(/Pickup:\s*([\d.-]+),\s*([\d.-]+)/i);
                    
                    if (carMatch) {
                        actualCarId = carMatch[1];
                    }
                    
                    if (pickupMatch) {
                        pickupCoords = {
                            lat: parseFloat(pickupMatch[1]),
                            lng: parseFloat(pickupMatch[2])
                        };

                    }
                }
                
                // Find the car using the actual car ID from notes
                const car = cars?.find((c: any) => c.car_id === actualCarId || c.id === actualCarId);
                
                // Find the car model using car_model_id from the car
                let carModel = null;
                if (car && car.car_model_id) {
                    carModel = carModels?.find((cm: any) => cm.car_model_id === car.car_model_id || cm.id === car.car_model_id);

                }
                
                // Find pickup and dropoff locations (fallback to table if available)
                const pickupLocation = locations?.find((l: any) => l.id === order.pickup_location_id);
                const dropoffLocation = locations?.find((l: any) => l.id === order.dropoff_location_id);
                
                // Determine driver name - we'll get role info when needed
                let driverName = 'Ekki úthlutað';
                
                if (order.staff_id) {
                    // For now, use generic staff identifier
                    // In the future, we could fetch individual staff roles using getUserRole
                    driverName = `Starfsmaður ${order.staff_id.slice(0, 8)}`;
                }

                return {
                    order_id: order.order_id,
                    user_id: order.user_id,
                    staff_id: order.staff_id,
                    car_id: order.car_id,
                    pickup_location_id: order.pickup_location_id,
                    dropoff_location_id: order.dropoff_location_id,
                    status: order.status,
                    notes: order.notes,
                    created_at: order.created_at,
                    // Real data from joins
                    pickup_location: pickupLocation?.name || pickupLocation?.address || 
                                   (pickupCoords ? `${pickupCoords.lat.toFixed(4)}, ${pickupCoords.lng.toFixed(4)}` : `Location ${order.pickup_location_id.slice(0, 8)}`),
                    dropoff_location: dropoffLocation?.name || dropoffLocation?.address || `Location ${order.dropoff_location_id.slice(0, 8)}`,
                    driver_name: driverName,
                    car_make: carModel?.make || 'Unknown Make',
                    car_model: carModel?.model || 'Unknown Model',
                    license_plate: car?.plate || 'Unknown Plate'
                };
            });

            setCompletedTrips(formattedOrders);
        } catch (error) {
            // Handle trips fetch error
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.rating === 0) {
            setMessage('Vinsamlegast veldu einkunn');
            return;
        }

        if (!selectedTrip) {
            setMessage('Villa: Engin ferð valin');
            return;
        }

        try {
            setSubmitting(true);
            setMessage('');

            const { user, error: userError } = await supabaseClient.getCurrentUser();
            if (userError || !user) {
                setMessage('Þú verður að vera innskráður til að skrifa umsögn');
                return;
            }

            const reviewData = {
                user_id: user.id,
                order_id: selectedTrip.order_id,
                rating: formData.rating
                // Note: created_at will be automatically set by the database
                // comment, pickup_location, dropoff_location, driver_name, car_info are not part of reviews table
            };

            const { error } = await supabaseClient.insertRow('reviews', reviewData, 'abyrgi');

            if (error) {
                setMessage('Villa kom upp við að vista umsögnina: ' + error.message);
            } else {
                // After successful review submission, archive the order
                try {
                const { error: archiveError } = await supabaseClient.updateRows('orders', { status: 'archived' }, { column: 'order_id', value: selectedTrip.order_id }, 'abyrgi');

                } catch (archiveError) {
                    console.warn('Failed to archive order after review:', archiveError);
                    // Don't fail the review process if archiving fails
                }

                setMessage('Takk fyrir umsögnina!');
                setFormData({ rating: 0 });
                setSelectedTrip(null);
                setShowForm(false);
                fetchReviews();
                fetchCompletedTrips(); // Refresh to remove reviewed trip
            }
        } catch (error) {
            setMessage('Villa kom upp við að vista umsögnina');
            // Handle review submission error
        } finally {
            setSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Ferðamat
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Gefðu okkur umsögn um ferðina þína
                </p>
            </div>

            {/* Completed Trip to Review */}
            {completedTrips.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
                        📋 Ferð tilbúin til umsagnar
                    </h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                            {completedTrips[0].pickup_location} → {completedTrips[0].dropoff_location}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {completedTrips[0].driver_name} • {completedTrips[0].car_make} {completedTrips[0].car_model}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            Pöntun: {completedTrips[0].order_id.slice(0, 8)}... • {new Date(completedTrips[0].created_at).toLocaleDateString('is-IS')}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedTrip(completedTrips[0]);
                            setShowForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Gefa umsögn um ferðina
                    </button>
                </div>
            )}

            {/* Stats */}
            {reviews.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                        <div>
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {reviews.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Þínar umsagnir
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">
                                {averageRating.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Þín meðaleinkunn
                            </div>
                            <StarRating rating={Math.round(averageRating)} readonly />
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Þínar umsagnir
                    </h2>
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {reviews.length === 0 && completedTrips.length === 0 && !loading && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🚗</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Engar ferðir til umsagnar
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Þegar þú hefur lokið ferð muntu geta gefið henni umsögn hér.
                    </p>
                </div>
            )}

            {/* Review Form Modal */}
            {showForm && selectedTrip && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-lg w-full mx-4 relative z-10 border border-gray-200 dark:border-gray-700">
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                            onClick={() => setShowForm(false)}
                        >
                            ×
                        </button>
                        
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                            Gefa umsögn um ferðina
                        </h2>

                        {/* Trip Details */}
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Ferðin þín:
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                📍 {selectedTrip.pickup_location} → {selectedTrip.dropoff_location}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                🚗 {selectedTrip.driver_name} • {selectedTrip.car_make} {selectedTrip.car_model} ({selectedTrip.license_plate})
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                Pöntun: {selectedTrip.order_id.slice(0, 8)}... • {new Date(selectedTrip.created_at).toLocaleDateString('is-IS')}
                            </p>
                        </div>
                        
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Hvernig var ferðin? *
                                </label>
                                <StarRating 
                                    rating={formData.rating} 
                                    onRatingChange={(rating) => setFormData({...formData, rating})}
                                />
                            </div>
                            
                            {/* Comment field removed - not part of reviews table schema */}
                            
                            {message && (
                                <div className={`p-3 rounded-lg ${
                                    message.includes('Villa') || message.includes('verður') 
                                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                        : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                }`}>
                                    {message}
                                </div>
                            )}
                            
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Hætta við
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-400 dark:disabled:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    {submitting ? 'Sendir mat...' : 'Senda mat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Homepage Link */}
            <div className="text-center pt-8">
                <a
                    href="/"
                    className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                    ← Meta ferðina (Til baka á forsíðu)
                </a>
            </div>
        </div>
    );
}

export default function ReviewPage() {
    return (
        <AuthGuard redirectTo="/review">
            <ReviewPageContent />
        </AuthGuard>
    );
}