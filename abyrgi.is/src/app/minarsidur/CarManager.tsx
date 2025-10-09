"use client";
import { supabaseClient } from "@/utils/supabase/supabase-library";
import { useEffect, useState } from "react";

export default function CarManager({ onCarChange }: { onCarChange: () => void }) {
    const [carData, setCarData] = useState({
        car_make: "",
        car_model: "",
        car_model_year: "",
        car_vin: "",
        color: "",
        manual: false,
        plate: "",
    });
    const [message, setMessage] = useState("");
    const [plateToDelete, setPlateToDelete] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [userIdState, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { user, error } = await supabaseClient.getCurrentUser();
            if (!error && user) {
                setUserId(user.id);
                console.log("CarManager: User authenticated:", user.id);
            } else {
                setUserId(null);
                console.log("CarManager: No user authenticated", error);
            }
        };

        fetchUser();
        
        const interval = setInterval(fetchUser, 1000);
        
        return () => {
            clearInterval(interval);
        };
    }, []);

    async function handleAddCar() {
        if (!userIdState) {
            setMessage("User not authenticated");
            return;
        }

        setMessage("Adding...");
        console.log("Authenticated Supabase UID:", userIdState);
        
        const { data, error } = await supabaseClient.insertRow(
            "cars", 
            { ...carData, user_id: userIdState }, 
            "abyrgi"
        );
        
        console.log("user_id in insert payload:", userIdState);
        if (error) setMessage("Error: " + error.message);
        else {
            setMessage("Car added!");
            onCarChange(); // Trigger refresh of cars list
        }
        setCarData({
            car_make: "",
            car_model: "",
            car_model_year: "",
            car_vin: "",
            color: "",
            manual: false,
            plate: "",
        });
    }

    async function handleDeleteCar() {
        if (!userIdState) {
            setMessage("User not authenticated");
            return;
        }

        setMessage("Deleting...");
        
        // First, find the car by plate to get its car_id
        const { data: cars, error: fetchError } = await supabaseClient.fetchData(
            "cars",
            "abyrgi"
        );
        
        if (fetchError) {
            setMessage("Error: " + fetchError.message);
            return;
        }
        
        const carToDelete = cars?.find((car: any) => car.plate === plateToDelete);
        
        if (!carToDelete) {
            setMessage("Error: Car not found with that plate");
            return;
        }

        // Now use the deleteCar function with the car_id
        const result = await supabaseClient.deleteCar(carToDelete.car_id, "abyrgi");
        
        if (result.error) {
            setMessage("Error: " + result.message);
        } else {
            setMessage(`Car deleted! ${result.clearedOrdersCount} order(s) updated.`);
            onCarChange(); // Trigger refresh of cars list
        }
        setPlateToDelete("");
    }

    return (
        <div className="max-w-md mx-auto my-8 p-4 border rounded themed-card shadow-md">
            <button
                className="bg-blue-600 text-white px-4 py-2 rounded mb-4 w-full hover:bg-blue-700 transition-colors"
                onClick={() => setShowPopup(true)}
            >
                Add/Delete Car
            </button>

            {showPopup && (
                <div 
                    className="fixed inset-0 grid place-items-center p-0.1"
                    style={{ zIndex: 9999 }}
                >
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowPopup(false)}
                    ></div>
                    
                    {/* Modal */}
                    <div 
                        className="relative z-10 border w-full max-w-2xl max-h-[88vh] overflow-y-auto p-6 rounded-lg shadow-xl"
                        style={{ 
                            marginTop: '29vh',
                            background: '#FFFFFF',
                            color: '#15121A',
                            borderColor: 'rgba(21, 18, 26, 0.1)'
                        }}
                    >
                        <style jsx>{`
                            @media (prefers-color-scheme: dark) {
                                div {
                                    background: #1f1c24 !important;
                                    color: #F7F8FA !important;
                                    border-color: rgba(247, 248, 250, 0.15) !important;
                                }
                            }
                        `}</style>
                        {/* Close button */}
                        <button
                            className="absolute top-3 right-3 text-4xl leading-none text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 w-10 h-10 flex items-center justify-center border-0 bg-transparent cursor-pointer"
                            onClick={() => setShowPopup(false)}
                        >
                            ×
                        </button>
                        
                        <h2 className="text-xl font-bold mb-4 pr-12">Add Car</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAddCar();
                            }}
                            className="space-y-2"
                        >
                            <input required className="themed-input w-full p-2 rounded" placeholder="Make" value={carData.car_make} onChange={(e) => setCarData({ ...carData, car_make: e.target.value })} />
                            <input required className="themed-input w-full p-2 rounded" placeholder="Model" value={carData.car_model} onChange={(e) => setCarData({ ...carData, car_model: e.target.value })} />
                            <input required className="themed-input w-full p-2 rounded" placeholder="Year" value={carData.car_model_year} onChange={(e) => setCarData({ ...carData, car_model_year: e.target.value })} />
                            <input required className="themed-input w-full p-2 rounded" placeholder="Color" value={carData.color} onChange={(e) => setCarData({ ...carData, color: e.target.value })} />
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={carData.manual}
                                    onChange={(e) => setCarData({ ...carData, manual: e.target.checked })}
                                />
                                <span>Manual</span>
                            </label>
                            <input required className="themed-input w-full p-2 rounded" placeholder="Plate" value={carData.plate} onChange={(e) => setCarData({ ...carData, plate: e.target.value })} />
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition-colors">Add Car</button>
                        </form>

                        <h2 className="text-xl font-bold mt-8 mb-4">Delete Car</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleDeleteCar();
                            }}
                            className="space-y-2"
                        >
                            <input className="themed-input w-full p-2 rounded" placeholder="Plate to delete" value={plateToDelete} onChange={(e) => setPlateToDelete(e.target.value)} />
                            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded w-full hover:bg-red-700 transition-colors">Delete Car</button>
                        </form>

                        {message && <p className="mt-4 text-center">{message}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}