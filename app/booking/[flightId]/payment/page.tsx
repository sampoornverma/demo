"use client"

import type React from "react"

import { useSearchParams, useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AlertCircle, CreditCard, Lock } from "lucide-react"
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

export default function PaymentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const flightId = params.flightId as string
  const passengersCount = Number.parseInt(searchParams.get("passengers") || "1")

  const [flight, setFlight] = useState<Flight | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  // Payment form state
  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [zipCode, setZipCode] = useState("")

  useEffect(() => {
    const fetchFlight = async () => {
      try {
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

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4)
    }
    setExpiryDate(value)
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim()
    setCardNumber(value)
  }

  const validatePayment = () => {
    if (!cardName.trim()) {
      setError("Please enter cardholder name")
      return false
    }
    if (!cardNumber.replace(/\s/g, "").match(/^\d{16}$/)) {
      setError("Please enter a valid 16-digit card number")
      return false
    }
    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
      setError("Please enter expiry date in MM/YY format")
      return false
    }
    if (!cvv.match(/^\d{3}$/)) {
      setError("Please enter a valid 3-digit CVV")
      return false
    }
    if (!zipCode.match(/^\d{5}$/)) {
      setError("Please enter a valid 5-digit zip code")
      return false
    }
    return true
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validatePayment()) {
      return
    }

    setProcessing(true)

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Get booking data from localStorage
      const passengers = JSON.parse(localStorage.getItem("bookingPassengers") || "[]")
      const seats = JSON.parse(localStorage.getItem("bookingSeats") || "[]")

      // Create booking
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightId,
          passengers,
          seats,
          totalPrice: flight!.price * passengersCount,
        }),
      })

      if (!bookingResponse.ok) {
        throw new Error("Booking failed")
      }

      const bookingData = await bookingResponse.json()

      // Store booking reference
      localStorage.setItem("lastBookingReference", bookingData.bookingReference)

      // Clear booking session data
      localStorage.removeItem("bookingPassengers")
      localStorage.removeItem("bookingSeats")

      // Redirect to confirmation
      router.push(`/booking/confirmation/${bookingData.bookingReference}`)
    } catch (err) {
      setError("Payment failed. Please try again.")
      console.error(err)
    } finally {
      setProcessing(false)
    }
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
          <h1 className="text-3xl font-bold mb-8">Payment</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Card className="p-6 mb-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </h3>

                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                    <Input
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number</label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      required
                      disabled={processing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry Date</label>
                      <Input
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        required
                        disabled={processing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        CVV
                      </label>
                      <Input
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        maxLength={3}
                        required
                        disabled={processing}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Zip Code</label>
                    <Input
                      placeholder="12345"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      maxLength={5}
                      required
                      disabled={processing}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={processing}>
                    {processing ? "Processing Payment..." : `Pay $${totalPrice}`}
                  </Button>
                </form>
              </Card>

              <p className="text-xs text-muted-foreground text-center">
                This is a test payment. Use any valid-looking card number.
              </p>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-4">
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>

                <div className="space-y-3 pb-4 border-b mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{flight.airline}</p>
                    <p className="font-semibold">{flight.flightNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {flight.from} → {flight.to}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pb-4 border-b mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base fare × {passengersCount}</span>
                    <span className="font-medium">${flight.price * passengersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes & fees</span>
                    <span className="font-medium">$0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seat selection</span>
                    <span className="font-medium">Free</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">${totalPrice}</span>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-700">✓ Secure payment protected by industry-standard encryption</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
