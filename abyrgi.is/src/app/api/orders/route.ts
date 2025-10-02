import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pickupLocation, dropoffLocation, carId, carInfo, notes } = body;

    // Validate required fields
    if (!pickupLocation || !dropoffLocation) {
      return NextResponse.json(
        { error: 'Missing required fields: pickupLocation, dropoffLocation' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Insert pickup location
    const { data: pickupLocationData, error: pickupError } = await supabase
      .schema('abyrgi')
      .from('locations')
      .insert({
        latitude: pickupLocation.lat,
        longitude: pickupLocation.lng,
        address: pickupLocation.address || null,
        name: pickupLocation.name || 'Pickup Location',
      })
      .select('id')
      .single();

    if (pickupError) {
      console.error('Error inserting pickup location:', pickupError);
      return NextResponse.json(
        { error: 'Failed to create pickup location', details: pickupError.message },
        { status: 500 }
      );
    }

    // Insert dropoff location
    const { data: dropoffLocationData, error: dropoffError } = await supabase
      .schema('abyrgi')
      .from('locations')
      .insert({
        latitude: dropoffLocation.lat,
        longitude: dropoffLocation.lng,
        address: dropoffLocation.address || null,
        name: dropoffLocation.name || 'Dropoff Location',
      })
      .select('id')
      .single();

    if (dropoffError) {
      console.error('Error inserting dropoff location:', dropoffError);
      return NextResponse.json(
        { error: 'Failed to create dropoff location', details: dropoffError.message },
        { status: 500 }
      );
    }

    // Prepare order data
    const orderData: {
      user_id: string;
      pickup_location_id: string;
      dropoff_location_id: string;
      car_id?: string | null;
      notes?: string | null;
      status: string;
    } = {
      user_id: user.id,
      pickup_location_id: pickupLocationData.id,
      dropoff_location_id: dropoffLocationData.id,
      notes: notes || null,
      status: 'pending',
    };

    // Include car_id if provided, otherwise include car info in notes
    if (carId) {
      orderData.car_id = carId;
    } else if (carInfo) {
      // If no car_id, include car details in notes
      const carNotes = `Car: ${carInfo.make} ${carInfo.model} (${carInfo.licensePlate})`;
      orderData.notes = orderData.notes ? `${orderData.notes}\n${carNotes}` : carNotes;
    }

    // Create the order
    const { data: createdOrder, error: orderError } = await supabase
      .schema('abyrgi')
      .from('orders')
      .insert(orderData)
      .select('*')
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: createdOrder,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
