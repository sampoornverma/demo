"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Plane, Clock, MapPin, DollarSign, Users } from "lucide-react"
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

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)

  const from = searchParams.get("from") || ""
  const to = searchParams.get("to") || ""
  const departDate = searchParams.get("departDate") || ""
  const passengers = Number.parseInt(searchParams.get("passengers") || "1")

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/flights?from=${from}&to=${to}`)
        const data = await response.json()
        setFlights(data)
      } catch (error) {
        console.error("Error fetching flights:", error)
      } finally {
        setLoading(false)
      }
    }

    if (from && to) {
      fetchFlights()
    }
  }, [from, to])

  const handleBookFlight = (flightId: string) => {
    router.push(`/booking/${flightId}?passengers=${passengers}&departDate=${departDate}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-muted/30 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Search Summary */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Flight Results</h1>
            <p className="text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>{from}</span>
              <MapPin className="w-4 h-4" />
              <span>{to}</span>
              <span>•</span>
              <span>{formatDate(departDate)}</span>
              <span>•</span>
              <Users className="w-4 h-4" />
              <span>
                {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
              </span>
            </p>
          </div>

          {/* Flight Results */}
          <div className="space-y-4">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <div className="grid grid-cols-3 gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </Card>
              ))
            ) : flights.length === 0 ? (
              // No results
              <Card className="p-12 text-center">
                <Plane className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold mb-2">No flights found</h2>
                <p className="text-muted-foreground mb-6">Try searching with different dates or locations</p>
                <Link href="/">
                  <Button>New Search</Button>
                </Link>
              </Card>
            ) : (
              // Flight cards
              flights.map((flight) => (
                <Card key={flight.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                    {/* Airline and Flight Info */}
                    <div>
                      <p className="font-bold text-sm text-muted-foreground mb-1">{flight.airline}</p>
                      <p className="text-lg font-semibold">{flight.flightNumber}</p>
                    </div>

                    {/* Departure */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Departure</p>
                      <p className="text-xl font-bold">{formatTime(flight.departureTime)}</p>
                      <p className="text-sm text-muted-foreground">{flight.from}</p>
                    </div>

                    {/* Duration */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="h-px bg-border flex-1"></div>
                        <Clock className="w-4 h-4 text-primary" />
                        <div className="h-px bg-border flex-1"></div>
                      </div>
                      <p className="text-sm font-medium">{flight.duration}</p>
                    </div>

                    {/* Arrival */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Arrival</p>
                      <p className="text-xl font-bold">{formatTime(flight.arrivalTime)}</p>
                      <p className="text-sm text-muted-foreground">{flight.to}</p>
                    </div>

                    {/* Price and Booking */}
                    <div className="text-right">
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-1">Price per person</p>
                        <p className="text-2xl font-bold text-primary flex items-center justify-end gap-1">
                          <DollarSign className="w-5 h-5" />
                          {flight.price}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {flight.availableSeats} of {flight.totalSeats} seats available
                        </p>
                      </div>
                      <Button
                        onClick={() => handleBookFlight(flight.id)}
                        disabled={flight.availableSeats === 0}
                        className="w-full"
                      >
                        {flight.availableSeats === 0 ? "Sold Out" : "Select"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
