import { type NextRequest, NextResponse } from "next/server"

// In-memory bookings storage
const bookings: Map<string, any> = new Map()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const reference = searchParams.get("reference")

  if (reference) {
    const booking = bookings.get(reference)
    if (booking) {
      return NextResponse.json(booking)
    }
    return NextResponse.json(null, { status: 404 })
  }

  return NextResponse.json(Array.from(bookings.values()))
}

export async function POST(request: NextRequest) {
  try {
    const { flightId, passengers, seats, totalPrice } = await request.json()

    if (!flightId || !passengers || !seats || totalPrice === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Generate booking reference
    const bookingReference = `SK${Date.now().toString().slice(-6)}`

    // Create booking object
    const booking = {
      id: bookingReference,
      bookingReference,
      flightId,
      passengers,
      seats,
      totalPrice,
      bookingDate: new Date().toISOString(),
      paymentStatus: "completed",
    }

    // Store booking
    bookings.set(bookingReference, booking)

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
