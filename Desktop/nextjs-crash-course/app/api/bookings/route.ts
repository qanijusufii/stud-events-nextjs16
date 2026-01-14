import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/database/booking.model';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/bookings
 * Creates a new booking for an event
 */
export async function POST(req: NextRequest) {
    try {
        // Connect to database
        await connectDB();

        // Parse request body
        const body = await req.json();
        const { eventId, slug, email } = body;

        // Validate required fields
        if (!eventId || !slug || !email) {
            return NextResponse.json(
                { 
                    message: 'Missing required fields',
                    required: ['eventId', 'slug', 'email']
                },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Create booking
        const booking = await Booking.create({
            eventId,
            slug,
            email
        });

        // Return success response
        return NextResponse.json(
            { 
                message: 'Booking created successfully',
                booking
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Booking creation failed:', error);

        // Handle duplicate booking error
        if (error instanceof Error && error.message.includes('duplicate')) {
            return NextResponse.json(
                { message: 'This email has already booked this event' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { 
                message: 'Booking creation failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}