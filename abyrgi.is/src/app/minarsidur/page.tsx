import { Car } from "lucide-react";
import CarManager from "@/app/minarsidur/CarManager";
import CarsList from "@/app//minarsidur/CarsList";

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

const TEST_USER_ID = "e8b12e10-b30a-426f-854b-6ffcebe9b2fb";

// --- Main page ---
export default async function MinarsidurPage() {
	return (
		<div className="min-h-screen">
			<h1 className="text-3xl font-bold text-center my-6">Bílarnir þínir</h1>
			<CarManager userId={TEST_USER_ID} />
			<CarsList />
		</div>
	);
}
