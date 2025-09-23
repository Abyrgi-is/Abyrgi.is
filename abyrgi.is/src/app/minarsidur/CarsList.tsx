"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Car = {
  user_id: string;
  created_at: string;
  car_id: string;
  car_make: string;
  car_model: string;
  car_model_year: number | null;
  car_vin: string;
  color: string | null;
  manual: boolean | null;
  plate: string;
};

export default function CarsList() {
  const supabase = createClient();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
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
        }
      } catch (e: any) {
        setError(e?.message ?? "Unknown error while fetching cars");
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p className="text-center">Loading cars…</p>;
  if (error) return <p className="text-center text-red-500">Failed to load cars: {error}</p>;

  if (cars.length === 0) return <p className="text-center">No cars found for this user.</p>;

  return (
    <div className="flex flex-col items-center gap-8 my-10">
      {cars.map((car) => (
        <div
          key={car.car_id}
          style={{ background: "#000", color: "#fff", border: "1px solid #222" }}
          className="w-full max-w-md rounded overflow-hidden shadow-lg hover:scale-105 transform transition"
        >
          <div style={{ padding: "1.5rem" }}>
            <div style={{ fontWeight: "bold", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
              {car.car_make} {car.car_model}
            </div>
            <p>Litur: {car.color ?? "Not Given"}</p>
            <p>Ár: {car.car_model_year ?? "Not Given"}</p>
            <p>Bílnúmer: {car.plate ?? "Not Given"}</p>
            <p>Beinsiptur: {car.manual === true ? "Já" : car.manual === false ? "Nei" : "Not Given"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
