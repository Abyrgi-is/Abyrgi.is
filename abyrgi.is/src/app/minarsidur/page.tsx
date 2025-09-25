"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import CarManager from "@/app/minarsidur/CarManager";
import CarsList from "@/app//minarsidur/CarsList";

// --- Car type ---
export type Car = {
	user_id: string;
	created_at: string;
	car_id: string;
	car_make: string;
	car_model: string;
	car_model_year: number;
	car_vin: string;
	color: string | null;
	manual: boolean | null;
	plate: string;
};

// --- Main page ---
export default function MinarsidurPage() {
	const supabase = createClient();
	const [cars, setCars] = useState<Car[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchCars = useCallback(async () => {
		try {
			setLoading(true);
			const { data: userRes } = await supabase.auth.getUser();
			const uid = userRes.user?.id;
			if (!uid) {
				setError("No authenticated user. Please sign in.");
				setLoading(false);
				return;
			}
			const { data, error } = await supabase
				.schema("abyrgi")
				.from("cars")
				.select("*")
				.eq("user_id", uid);
			if (error) {
				setError(error.message);
			} else {
				setCars((data as Car[]) ?? []);
				setError(null);
			}
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Unknown error while fetching cars");
		} finally {
			setLoading(false);
		}
	}, [supabase]);

	useEffect(() => {
		fetchCars();
	}, [fetchCars]);

	return (
		<div className="min-h-screen">
			<h1 className="text-3xl font-bold text-center my-6">Bílarnir þínir</h1>
			<CarManager onCarChange={fetchCars} />
			<CarsList cars={cars} loading={loading} error={error} />
		</div>
	);
}
