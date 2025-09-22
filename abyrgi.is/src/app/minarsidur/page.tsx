import { Car } from "lucide-react";
import CarManager from "./CarManager";
import { supabaseClient } from "@/utils/supabase/supabase-library";

// --- Car type ---
type Car = {
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

// --- Server-side fetch ---
const TEST_USER_ID = "e8b12e10-b30a-426f-854b-6ffcebe9b2fb";

async function getUserCars(userId: string) {
	const { data, error } = await supabaseClient.fetchData("Cars", "Abyrgi");
	if (error) {
		console.error("Error fetching cars:", error);
		return [];
	}
	return (data as Car[])
		.filter((car) => car.user_id === userId);
}

// --- Main page ---
export default async function MinarsidurPage() {
	const cars = await getUserCars(TEST_USER_ID);


	return (
		<div className="min-h-screen">
			<h1 className="text-3xl font-bold text-center my-6">Bílarnir þínir</h1>
			<CarManager userId={TEST_USER_ID} />
			<div className="flex flex-col items-center gap-8 my-10">
				   {cars.map((car) => (
					   <div
						   key={car.car_id}
						   style={{
							   background: '#000',
							   color: '#fff',
							   border: '1px solid #222',
						   }}
						   className="w-full max-w-md rounded overflow-hidden shadow-lg hover:scale-105 transform transition"
					   >
						   <div style={{ padding: '1.5rem' }}>
							   <div style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
								   {car.car_make} {car.car_model}
							   </div>
							   <p>Litur: {car.color ?? "Not Given"}</p>
							   <p>Ár: {car.car_model_year ?? "Not Given"}</p>
							   <p>Bílnúmer: {car.plate ?? "Not Given"}</p>
							   <p>Beinsiptur: {car.manual === true ? "Já" : car.manual === false ? "Nei" : "Not Given"}</p>
						   </div>
					   </div>
				   ))}

				   {cars.length === 0 && (
					   <p>No cars found for this user.</p>
				   )}
			</div>
		</div>
	);
}
