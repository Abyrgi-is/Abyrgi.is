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
        

        const { data, error } = await supabaseClient.deleteRows(
            "cars",
            { column: "plate", value: plateToDelete },
            "abyrgi"
        );
        
        if (error) setMessage("Error: " + error.message);
        else {
            setMessage("Car deleted!");
            onCarChange(); // Trigger refresh of cars list
        }
        setPlateToDelete("");
    }

    return (
        <div className="max-w-md mx-auto my-8 p-4 border rounded bg-white dark:bg-[#15121aff]">
            
            <button
                className="bg-blue-600 text-white px-4 py-2 rounded mb-4 w-full"
                onClick={() => setShowPopup(true)}
            >
                Add/Delete Car
            </button>

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50"
                    style={{
                        background: "rgba(30, 41, 59, 0.55)", // slate-800 with 55% opacity
                        backdropFilter: "blur(4px)"
                    }}
                >
                    <div className="bg-white dark:bg-[#15121aff] p-6 rounded shadow-lg max-w-md w-full relative border dark:border-gray-700">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => setShowPopup(false)}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Add Car</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAddCar();
                            }}
                            className="space-y-2"
                        >
                            <input required className="border p-2 w-full bg-white dark:bg-[#15121aff] text-gray-900 dark:text-gray-100" placeholder="Make" value={carData.car_make} onChange={(e) => setCarData({ ...carData, car_make: e.target.value })} />
                            <input required className="border p-2 w-full bg-white dark:bg-[#15121aff] text-gray-900 dark:text-gray-100" placeholder="Model" value={carData.car_model} onChange={(e) => setCarData({ ...carData, car_model: e.target.value })} />
                            <input required className="border p-2 w-full bg-white dark:bg-[#15121aff] text-gray-900 dark:text-gray-100" placeholder="Year" value={carData.car_model_year} onChange={(e) => setCarData({ ...carData, car_model_year: e.target.value })} />
                            <input required className="border p-2 w-full bg-white dark:bg-[#15121aff] text-gray-900 dark:text-gray-100" placeholder="Color" value={carData.color} onChange={(e) => setCarData({ ...carData, color: e.target.value })} />
                            <label className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                                <input
                                    type="checkbox"
                                    checked={carData.manual}
                                    onChange={(e) => setCarData({ ...carData, manual: e.target.checked })}
                                />
                                <span>Manual</span>
                            </label>
                            <input required className="border p-2 w-full bg-white dark:bg-[#15121aff] text-gray-900 dark:text-gray-100" placeholder="Plate" value={carData.plate} onChange={(e) => setCarData({ ...carData, plate: e.target.value })} />
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Add Car</button>
                        </form>

                        <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">Delete Car</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleDeleteCar();
                            }}
                            className="space-y-2"
                        >
                            <input className="border p-2 w-full bg-white dark:bg-[#15121aff] text-gray-900 dark:text-gray-100" placeholder="Plate to delete" value={plateToDelete} onChange={(e) => setPlateToDelete(e.target.value)} />
                            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded w-full">Delete Car</button>
                        </form>

                        {message && <p className="mt-4 text-center text-gray-900 dark:text-gray-100">{message}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}