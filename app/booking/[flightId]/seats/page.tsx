"use client"

import { useSearchParams, useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface Flight {
  id: string
  airline: string
  flightNumber: string
  from: string
  to: string
  price: number
}

interface SeatMap {
  [key: string]: "available" | "occupied" | "selected"
}

export default function SeatSelectionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const flightId = params.flightId as string
  const passengersCount = Number.parseInt(searchParams.get("passengers") || "1")

  const [flight, setFlight] = useState<Flight | null>(null)
  const [loading, setLoading] = useState(true)
  const [seats, setSeats] = useState<SeatMap>({})
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [error, setError] = useState("")

  const rows = 18
  const seatsPerRow = 6
  const seatLetters = ["A", "B", "C", "D", "E", "F"]

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const response = await fetch(`/api/flights`)
        const data = await response.json()
        const selectedFlight = data.find((f: Flight) => f.id === flightId)
        if (selectedFlight) {
          setFlight(selectedFlight)

          // Initialize seat map
          const seatMap: SeatMap = {}
          for (let i = 1; i <= rows; i++) {
            for (let j = 0; j < seatsPerRow; j++) {
              const seatId = `${i}${seatLetters[j]}`
              // Randomly mark some seats as occupied
              seatMap[seatId] = Math.random() > 0.7 ? "occupied" : "available"
            }
          }
          setSeats(seatMap)
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

  const handleSeatClick = (seatId: string) => {
    if (seats[seatId] === "occupied") return

    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId)
      } else if (prev.length < passengersCount) {
        return [...prev, seatId]
      }
      return prev
    })
  }

  const handleContinueToPayment = () => {
    setError("")

    if (selectedSeats.length !== passengersCount) {
      setError(`Please select ${passengersCount} seat(s)`)
      return
    }

    // Store selected seats and proceed to payment
    localStorage.setItem("bookingSeats", JSON.stringify(selectedSeats))
    router.push(`/booking/${flightId}/payment?passengers=${passengersCount}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 bg-muted/30 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <Skeleton className="h-96 w-full" />
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
          <h1 className="text-3xl font-bold mb-8">Select Your Seats</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Seat Map */}
            <div className="lg:col-span-2">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Card className="p-8">
                <div className="bg-gradient-to-b from-primary/10 to-transparent p-4 rounded-lg mb-8 text-center">
                  <p className="text-sm font-semibold text-primary">Cockpit</p>
                </div>

                <div className="space-y-2 mb-8">
                  {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex items-center justify-center gap-2">
                      <span className="w-6 text-right text-xs text-muted-foreground font-medium">{rowIndex + 1}</span>
                      <div className="flex gap-2">
                        {seatLetters.map((letter, colIndex) => {
                          const seatId = `${rowIndex + 1}${letter}`
                          const status = seats[seatId]
                          const isSelected = selectedSeats.includes(seatId)

                          return (
                            <button
                              key={seatId}
                              onClick={() => handleSeatClick(seatId)}
                              disabled={status === "occupied"}
                              className={`w-8 h-8 rounded text-xs font-semibold transition-all ${
                                status === "occupied"
                                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                                  : isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                              title={seatId}
                            >
                              {letter}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex gap-6 justify-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-muted"></div>
                    <span>Occupied</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Summary */}
            <div>
              <Card className="p-6 sticky top-4">
                <h3 className="font-bold text-lg mb-4">Selected Seats</h3>

                <div className="mb-6 p-3 bg-muted rounded">
                  {selectedSeats.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">No seats selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map((seat) => (
                        <span
                          key={seat}
                          className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-semibold"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pb-4 border-b mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Passengers</span>
                    <span className="font-medium">{passengersCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">${totalPrice}</span>
                  </div>
                </div>

                <Button
                  onClick={handleContinueToPayment}
                  disabled={selectedSeats.length !== passengersCount}
                  className="w-full"
                  size="lg"
                >
                  Continue to Payment
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
