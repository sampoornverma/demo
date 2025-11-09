"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { User, Mail, LogOut, Plane, Calendar, MapPin, DollarSign, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Booking {
  bookingReference: string
  flightId: string
  passengers: Array<{ name: string; email: string }>
  seats: string[]
  totalPrice: number
  bookingDate: string
  paymentStatus: "completed" | "pending"
}

interface Flight {
  id: string
  airline: string
  flightNumber: string
  from: string
  to: string
  departureTime: string
  duration: string
  price: number
}

interface UserData {
  id: string
  name: string
  email: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [flights, setFlights] = useState<Map<string, Flight>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get user from localStorage
        const storedUser = localStorage.getItem("user")
        if (!storedUser) {
          router.push("/login")
          return
        }

        setUser(JSON.parse(storedUser))

        // Fetch all bookings
        const bookingsResponse = await fetch("/api/bookings")
        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData)

        // Fetch all flights
        const flightsResponse = await fetch("/api/flights")
        const flightsData = await flightsResponse.json()

        const flightMap = new Map<string, Flight>()
        flightsData.forEach((flight: Flight) => {
          flightMap.set(flight.id, flight)
        })
        setFlights(flightMap)
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 bg-muted/30 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="lg:col-span-2 h-96 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-muted/30 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Information */}
            <div>
              <Card className="p-6 sticky top-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <User className="w-6 h-6 text-primary" />
                </div>

                <h2 className="text-2xl font-bold mb-2">{user.name}</h2>

                <div className="flex items-center gap-2 text-muted-foreground mb-6">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>

                <div className="space-y-2 mb-6 pb-6 border-b">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Member Since</p>
                    <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Total Bookings</p>
                    <p className="font-semibold">{bookings.length}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Total Spent</p>
                    <p className="font-semibold">${bookings.reduce((sum, b) => sum + b.totalPrice, 0)}</p>
                  </div>
                </div>

                <Button onClick={handleLogout} variant="destructive" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </Card>
            </div>

            {/* Booking History */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Booking History</h2>

              {bookings.length === 0 ? (
                <Card className="p-12 text-center">
                  <Plane className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground mb-6">Start your journey by booking a flight</p>
                  <Link href="/">
                    <Button>Search Flights</Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const flight = flights.get(booking.flightId)
                    if (!flight) return null

                    const departDate = new Date(flight.departureTime)
                    const isUpcoming = departDate > new Date()

                    return (
                      <Card
                        key={booking.bookingReference}
                        className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                          {/* Status Badge */}
                          <div>
                            <div
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                isUpcoming ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                              }`}
                            >
                              {isUpcoming ? "Upcoming" : "Completed"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Ref: {booking.bookingReference}</p>
                          </div>

                          {/* Flight Info */}
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">{flight.airline}</p>
                            <p className="font-bold">{flight.flightNumber}</p>
                            <div className="flex items-center gap-1 mt-2 text-sm">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {flight.from} → {flight.to}
                              </span>
                            </div>
                          </div>

                          {/* Date and Time */}
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Departure</p>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="font-semibold">{departDate.toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {departDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>

                          {/* Price and Action */}
                          <div className="flex justify-between items-end md:items-start">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Total Price</p>
                              <p className="text-2xl font-bold text-primary flex items-center gap-1">
                                <DollarSign className="w-5 h-5" />
                                {booking.totalPrice}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>

                        {/* Passengers */}
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Passengers ({booking.passengers.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {booking.passengers.map((passenger, index) => (
                              <div key={index} className="text-xs bg-muted px-2 py-1 rounded">
                                <span className="font-semibold">{passenger.name}</span>
                                <span className="text-muted-foreground ml-1">• Seat {booking.seats[index]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
