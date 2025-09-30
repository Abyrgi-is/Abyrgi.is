"use client";
import { useEffect, useState, useCallback } from "react";
import { supabaseClient } from "@/utils/supabase/supabase-library";
import CarManager from "@/app/minarsidur/CarManager";
import CarsList from "@/app//minarsidur/CarsList";
import { useRouter } from "next/navigation";

// --- Car type ---
export type Car = {
	user_id: string;
	created_at: string;
	car_id: string;
	car_make: string;
	car_model: string;
	car_model_year: number;
	color: string | null;
	manual: boolean | null;
	plate: string;
};

// --- Main page ---
export default function MinarsidurPage() {
	const [cars, setCars] = useState<Car[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [authChecked, setAuthChecked] = useState(false);
	const router = useRouter();

	useEffect(() => {
		let isMounted = true;
		
		const checkAuth = async () => {
			const { user, error } = await supabaseClient.getCurrentUser();
			
			if (!user && isMounted) {
				router.replace("/sign_in?redirect=/minarsidur");
			} else if (isMounted) {
				setAuthChecked(true);
			}
		};
		
		checkAuth();
		
		return () => { 
			isMounted = false; 
		};
	}, [router]);

	const fetchCars = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const { user, error: userError } = await supabaseClient.getCurrentUser();
			if (userError || !user) {
				setError("No authenticated user. Please sign in.");
				setLoading(false);
				return;
			}

			const { data, error } = await supabaseClient.getCarsByUser(
				user.id,
				"abyrgi",
				{ table: "cars" }
			);

			if (error) {
				setError(error.message);
			} else {
				setCars((data as Car[]) ?? []);
			}
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Unknown error while fetching cars");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (authChecked) {
			fetchCars();
		}
	}, [fetchCars, authChecked]);

	if (!authChecked) {
		return <div className="min-h-screen flex items-center justify-center">Hleð...</div>;
	}

	return (
		<div className="min-h-screen">
			<h1 className="text-3xl font-bold text-center my-6">Bílarnir þínir</h1>
			<CarManager onCarChange={fetchCars} />
			<CarsList cars={cars} loading={loading} error={error} />
		</div>
	);
}
