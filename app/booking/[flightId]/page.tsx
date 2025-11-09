"use client"

import { useSearchParams, useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AlertCircle, Users, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

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

interface Passenger {
  name: string
  email: string
}

export default function BookingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const flightId = params.flightId as string
  const passengersCount = Number.parseInt(searchParams.get("passengers") || "1")

  const [flight, setFlight] = useState<Flight | null>(null)
  const [loading, setLoading] = useState(true)
  const [passengers, setPassengers] = useState<Passenger[]>(
    Array.from({ length: passengersCount }, () => ({ name: "", email: "" })),
  )
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // Get current user
    const user = localStorage.getItem("user")
    if (user) {
      setCurrentUser(JSON.parse(user))
      // Pre-fill first passenger with user info
      setPassengers((prev) => {
        const updated = [...prev]
        updated[0] = { name: JSON.parse(user).name, email: JSON.parse(user).email }
        return updated
      })
    }

    // Fetch flight details
    const fetchFlight = async () => {
      try {
        // Mock flight fetch - in production, query by ID
        const response = await fetch(`/api/flights`)
        const data = await response.json()
        const selectedFlight = data.find((f: Flight) => f.id === flightId)
        if (selectedFlight) {
          setFlight(selectedFlight)
        }
      } catch (error) {
        console.error("Error fetching flight:", error)
        setError("Failed to load flight details")
      } finally {
        setLoading(false)
      }
    }

    fetchFlight()
  }, [flightId])

  const handlePassengerChange = (index: number, field: "name" | "email", value: string) => {
    setPassengers((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleContinueToSeats = () => {
    setError("")

    // Validate all passengers
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].name.trim()) {
        setError(`Please enter name for passenger ${i + 1}`)
        return
      }
      if (!passengers[i].email.trim() || !passengers[i].email.includes("@")) {
        setError(`Please enter valid email for passenger ${i + 1}`)
        return
      }
    }

    // Store passengers and go to seat selection
    localStorage.setItem("bookingPassengers", JSON.stringify(passengers))
    router.push(`/booking/${flightId}/seats?passengers=${passengersCount}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 bg-muted/30 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 bg-muted/30 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Flight not found</AlertDescription>
            </Alert>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const totalPrice = flight.price * passengersCount

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-muted/30 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Passenger Information</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Flight Summary */}
              <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{flight.airline}</p>
                    <p className="text-2xl font-bold">{flight.flightNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {flight.from} → {flight.to}
                    </p>
                    <p className="text-lg font-semibold">{flight.duration}</p>
                  </div>
                </div>
              </Card>

              {/* Passenger Forms */}
              <div className="space-y-4">
                {passengers.map((passenger, index) => (
                  <Card key={index} className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Passenger {index + 1}
                      {index === 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Primary</span>
                      )}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <Input
                          placeholder="Enter full name"
                          value={passenger.name}
                          onChange={(e) => handlePassengerChange(index, "name", e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </label>
                        <Input
                          type="email"
                          placeholder="passenger@example.com"
                          value={passenger.email}
                          onChange={(e) => handlePassengerChange(index, "email", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar Summary */}
            <div>
              <Card className="p-6 sticky top-4">
                <h3 className="font-bold text-lg mb-4">Booking Summary</h3>

                <div className="space-y-3 pb-4 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base fare × {passengersCount}</span>
                    <span className="font-medium">${flight.price * passengersCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes & fees</span>
                    <span className="font-medium">$0</span>
                  </div>
                </div>

                <div className="pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Price</span>
                    <span className="text-2xl font-bold text-primary">${totalPrice}</span>
                  </div>
                </div>

                <Button onClick={handleContinueToSeats} className="w-full" size="lg">
                  Select Seats
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
