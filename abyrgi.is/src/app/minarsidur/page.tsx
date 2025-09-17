
const cars = [
  {
    "user_id": "38eb1bd3-4f38-42a0-8eba-edbd75d493e4",
    "created_at": "2025-09-05T16:17:25.031629+00:00",
    "car_id": "2009e647-183a-448e-8c93-7e9e32a79a78",
    "car_make": "Buick",
    "car_model": "Century",
    "car_model_year": 1990,
    "car_vin": "2T3BFREV8EW384631",
    "color": null,
    "manual": null
  },
  {
    "user_id": "e1eac711-726f-4dbc-b4f5-9b5f17d57384",
    "created_at": "2025-09-05T16:17:25.031629+00:00",
    "car_id": "fa80ed4f-f9d4-41e0-9e63-edd29b101959",
    "car_make": "Subaru",
    "car_model": "Baja",
    "car_model_year": 2004,
    "car_vin": "WBAUN93589V028320",
    "color": null,
    "manual": null
  },
  {
    "user_id": "4146c3cb-87fa-4096-85ed-181c6c835877",
    "created_at": "2025-09-05T16:17:25.031629+00:00",
    "car_id": "9648869b-f044-4d89-9bae-2a987b7968d1",
    "car_make": "Ford",
    "car_model": "E-Series",
    "car_model_year": 2003,
    "car_vin": "WAUHFBFL6BN114361",
    "color": null,
    "manual": null
  }
];


export function Bilar() {
  return (
    <div className="flex flex-col items-center gap-8 my-10">
      {cars.map((car) => (
        <div
          key={car.car_id}
          className="w-full max-w-md rounded overflow-hidden shadow-lg bg-white hover:scale-105 transform transition"
        >
          <div className="px-6 py-4">

            <div className="font-bold text-xl mb-2">{car.car_make + ' ' + car.car_model}</div>
            <p className="text-gray-700 text-base">Color: {car.color}</p>
            <p className="text-gray-700 text-base">Year: {car.car_model_year}</p>
            <p className="text-gray-700 text-base">Vin númer: {car.car_vin}</p>
            <p className="text-gray-700 text-base">{car.manual}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MinarsidurPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center my-6">Bílarnir þínir</h1>
      <Bilar />
    </div>
  );
}
