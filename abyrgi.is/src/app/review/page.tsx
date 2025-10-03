"use client";

import { AuthGuard } from '@/components/auth';
import { useState, useEffect } from 'react';
import { supabaseClient } from '@/utils/supabase/supabase-library';

interface Review {
    id: string;
    user_id: string;
    order_id?: string;
    rating: number;
    comment?: string;
    pickup_location?: string;
    dropoff_location?: string;
    driver_name?: string;
    car_info?: string;
    created_at: string;
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
    // Joined data
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
    const stars = [1, 2, 3, 4, 5];
    
    return (
        <div className="flex space-x-1">
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`text-2xl transition-colors ${
                        star <= rating 
                            ? 'text-yellow-400' 
                            : 'text-gray-300 dark:text-gray-600'
                    } ${!readonly && onRatingChange ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}
                    onClick={() => !readonly && onRatingChange && onRatingChange(star)}
                    disabled={readonly}
                >
                    ★
                </button>
            ))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
            
            {/* Comment */}
            {review.comment && (
                <div>
                    <p className="text-gray-700 dark:text-gray-200 leading-relaxed italic">
                        "{review.comment}"
                    </p>
                </div>
            )}
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
        comment: '',
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
            // Try to fetch from reviews table - you may need to create this table in Supabase
            const { data, error } = await supabaseClient.fetchData('reviews', 'abyrgi');
            
            if (error) {
                // If table doesn't exist (404), just set empty reviews
                if (error.message?.includes('404') || error.code === 'PGRST116') {
                    console.log('Reviews table not found - starting with empty reviews');
                    setReviews([]);
                } else {
                    console.error('Error fetching reviews:', error);
                    setReviews([]);
                }
            } else {
                // Sort by creation date, newest first
                const sortedReviews = (data || []).sort((a: any, b: any) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setReviews(sortedReviews);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompletedTrips = async () => {
        try {
            const { user, error: userError } = await supabaseClient.getCurrentUser();
            if (userError || !user) return;

            // Fetch completed orders for the current user
            const { data: orders, error } = await supabaseClient.fetchData('orders', 'abyrgi');
            
            if (error) {
                console.error('Error fetching orders:', error);
                return;
            }

            // Filter for completed orders by this user that haven't been reviewed yet
            const userCompletedOrders = (orders || []).filter((order: any) => 
                order.user_id === user.id && 
                order.status === 'completed'
            );

            // For now, we'll use simplified data - you may want to add joins for location names, staff names, and car details
            const formattedOrders: OrderData[] = userCompletedOrders.map((order: any) => ({
                order_id: order.order_id,
                user_id: order.user_id,
                staff_id: order.staff_id,
                car_id: order.car_id,
                pickup_location_id: order.pickup_location_id,
                dropoff_location_id: order.dropoff_location_id,
                status: order.status,
                notes: order.notes,
                created_at: order.created_at,
                // Placeholder data - replace with actual joins
                pickup_location: 'Pickup Location',
                dropoff_location: 'Dropoff Location',
                driver_name: 'Driver Name',
                car_make: 'Car Make',
                car_model: 'Car Model',
                license_plate: 'XXX-XXX'
            }));

            setCompletedTrips(formattedOrders);
        } catch (error) {
            console.error('Error fetching trips:', error);
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
                rating: formData.rating,
                comment: formData.comment.trim() || null,
                pickup_location: selectedTrip.pickup_location,
                dropoff_location: selectedTrip.dropoff_location,
                driver_name: selectedTrip.driver_name,
                car_info: `${selectedTrip.car_make} ${selectedTrip.car_model} (${selectedTrip.license_plate})`,
                created_at: new Date().toISOString()
            };

            const { error } = await supabaseClient.insertRow('reviews', reviewData, 'abyrgi');

            if (error) {
                setMessage('Villa kom upp við að vista umsögnina: ' + error.message);
            } else {
                setMessage('Takk fyrir umsögnina!');
                setFormData({
                    rating: 0,
                    comment: ''
                });
                setSelectedTrip(null);
                setShowForm(false);
                fetchReviews(); // Refresh reviews
            }
        } catch (error) {
            setMessage('Villa kom upp við að vista umsögnina');
            console.error('Error submitting review:', error);
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
                            Pöntun: {completedTrips[0].order_id.slice(0, 8)}...
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedTrip(completedTrips[0]);
                            setShowForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
                                Umsagnir um ferðir
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-yellow-500">
                                {averageRating.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Meðaleinkunn
                            </div>
                            <StarRating rating={Math.round(averageRating)} readonly />
                        </div>
                    </div>
                </div>
            )}

            {/* Review Form Modal */}
            {showForm && selectedTrip && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-lg w-full mx-4 relative z-10 border border-gray-200 dark:border-gray-700">
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                                Pöntun: {selectedTrip.order_id.slice(0, 8)}...
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
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Athugasemdir (valfrjálst)
                                </label>
                                <textarea
                                    value={formData.comment}
                                    onChange={(e) => setFormData({...formData, comment: e.target.value})}
                                    rows={4}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder="Viltu segja okkur eitthvað meira um ferðina? (valfrjálst)"
                                />
                            </div>
                            
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
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
                    ← Til baka á forsíðu
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