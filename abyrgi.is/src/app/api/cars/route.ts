import { NextRequest, NextResponse } from 'next/server';

// Simple car interface
interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  location: string;
}

// Mock database - in a real app this would be a proper database
let cars: Car[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    licensePlate: 'ABC-123',
    location: 'Reykjavik'
  },
  {
    id: '2',
    make: 'Volkswagen',
    model: 'Golf',
    year: 2019,
    licensePlate: 'DEF-456',
    location: 'Akureyri'
  },
  {
    id: '3',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    licensePlate: 'GHI-789',
    location: 'Keflavik'
  }
];

// GET - Fetch all cars
export async function GET() {
  return NextResponse.json({ cars });
}

// POST - Add a new car
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newCar: Car = {
      id: Date.now().toString(), // Simple ID generation
      make: body.make,
      model: body.model,
      year: body.year,
      licensePlate: body.licensePlate,
      location: body.location
    };
    
    cars.push(newCar);
    return NextResponse.json({ car: newCar, message: 'Car added successfully' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE - Remove a car
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Car ID is required' }, { status: 400 });
    }
    
    const initialLength = cars.length;
    cars = cars.filter(car => car.id !== id);
    
    if (cars.length === initialLength) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Car deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
  }
}