import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pickupLocation, dropoffLocation, carId, notes } = body;

    // Validate required fields
    if (!pickupLocation || !dropoffLocation || !carId) {
      return NextResponse.json(
        { error: 'Missing required fields: pickupLocation, dropoffLocation, carId' },
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

    // Create the order
    const { data: orderData, error: orderError } = await supabase
      .schema('abyrgi')
      .from('orders')
      .insert({
        user_id: user.id,
        pickup_location_id: pickupLocationData.id,
        dropoff_location_id: dropoffLocationData.id,
        car_id: carId,
        notes: notes || null,
        status: 'pending',
      })
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
      order: orderData,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
