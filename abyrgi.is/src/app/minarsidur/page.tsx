// Mock data
const cars = [
  {
    id: 1,
    name: "Tesla Model S",
    image: "/images/tesla.jpg",
    bilnumer: "EF789",
    litur: "White",
    year: 2022,
    gearbox: "Automatic",
    price: "$80,000",
  },
  {
    id: 2,
    name: "BMW i8",
    image: "/images/bmw.jpg",
    bilnumer: "CD456",
    litur: "Blue",
    year: 2021,
    gearbox: "Automatic",
    price: "$140,000",
  },
  {
    id: 3,
    name: "Audi R8",
    image: "/images/audi.jpg",
    bilnumer: "AB123",
    litur: "Red",
    year: 2023,
    gearbox: "Manual",
  },
];

export function Bilar() {
  return (
    <div className="flex flex-col items-center gap-8 my-10">
      {cars.map((car) => (
        <div
          key={car.id}
          className="w-full max-w-md rounded overflow-hidden shadow-lg bg-white hover:scale-105 transform transition"
        >
          <div className="px-6 py-4">
            <img
              className="w-full h-48 object-cover"
              src={car.image}
              alt={car.name}
            />
            <div className="font-bold text-xl mb-2">{car.name}</div>
            <p className="text-gray-700 text-base">Color: {car.litur}</p>
            <p className="text-gray-700 text-base">Year: {car.year}</p>
            <p className="text-gray-700 text-base">Bilnúmer: {car.bilnumer}</p>
            <p className="text-gray-700 text-base">{car.gearbox}</p>
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
