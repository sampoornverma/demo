// In-memory database for demo purposes
// In production, this would be MongoDB

interface User {
  id: string
  email: string
  password: string
  name: string
  createdAt: Date
}

interface Flight {
  id: string
  airline: string
  flightNumber: string
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  availableSeats: number
  totalSeats: number
}

interface Booking {
  id: string
  userId: string
  flightId: string
  passengers: Array<{
    name: string
    email: string
    passport: string
  }>
  seats: string[]
  totalPrice: number
  paymentStatus: "pending" | "completed"
  bookingDate: Date
  bookingReference: string
}

// In-memory stores
export const users: Map<string, User> = new Map()
export const flights: Map<string, Flight> = new Map()
export const bookings: Map<string, Booking> = new Map()

// Initialize with sample flights
export function initializeFlights() {
  const sampleFlights: Flight[] = [
    {
      id: "FL001",
      airline: "SkyAir",
      flightNumber: "SA-101",
      from: "New York (JFK)",
      to: "London (LHR)",
      departureTime: "2024-12-20T10:00:00",
      arrivalTime: "2024-12-20T22:00:00",
      duration: "7h 30m",
      price: 450,
      availableSeats: 45,
      totalSeats: 180,
    },
    {
      id: "FL002",
      airline: "AeroGlobal",
      flightNumber: "AG-205",
      from: "New York (JFK)",
      to: "London (LHR)",
      departureTime: "2024-12-20T14:30:00",
      arrivalTime: "2024-12-21T02:30:00",
      duration: "8h 00m",
      price: 380,
      availableSeats: 78,
      totalSeats: 180,
    },
    {
      id: "FL003",
      airline: "SkyAir",
      flightNumber: "SA-102",
      from: "New York (JFK)",
      to: "London (LHR)",
      departureTime: "2024-12-21T08:00:00",
      arrivalTime: "2024-12-21T20:00:00",
      duration: "7h 30m",
      price: 520,
      availableSeats: 12,
      totalSeats: 180,
    },
  ]

  sampleFlights.forEach((flight) => {
    flights.set(flight.id, flight)
  })
}

initializeFlights()
