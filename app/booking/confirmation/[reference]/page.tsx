"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckCircle2, Download, Home, MailOpen } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BookingDetails {
  bookingReference: string
  flightId: string
  passengers: Array<{ name: string; email: string }>
  seats: string[]
  totalPrice: number
  bookingDate: string
}

export default function ConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const reference = params.reference as string

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [flightDetails, setFlightDetails] = useState<any>(null)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // In a real app, this would query the backend
        // For now, we'll get it from the bookings we created
        const response = await fetch(`/api/bookings?reference=${reference}`)
        const data = await response.json()

        if (data) {
          setBooking(data)

          // Fetch flight details
          const flightResponse = await fetch(`/api/flights`)
          const flights = await flightResponse.json()
          const flight = flights.find((f: any) => f.id === data.flightId)
          if (flight) {
            setFlightDetails(flight)
          }
        }
      } catch (error) {
        console.error("Error fetching booking:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [reference])

  const handleDownloadItinerary = () => {
    if (!booking || !flightDetails) return

    const itinerary = `
BOOKING CONFIRMATION
${booking.bookingReference}

Flight Details:
${flightDetails.airline} ${flightDetails.flightNumber}
${flightDetails.from} → ${flightDetails.to}
Departure: ${new Date(flightDetails.departureTime).toLocaleString()}
Duration: ${flightDetails.duration}

Passengers:
${booking.passengers.map((p, i) => `${i + 1}. ${p.name} (${p.email}) - Seat ${booking.seats[i]}`).join("\n")}

Total Price: $${booking.totalPrice}
Booking Date: ${new Date(booking.bookingDate).toLocaleString()}

Status: CONFIRMED
    `.trim()

    const blob = new Blob([itinerary], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `booking-${booking.bookingReference}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 bg-muted/30 py-12 flex items-center justify-center">
          <p>Loading confirmation details...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!booking || !flightDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 bg-muted/30 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <Alert variant="destructive">
              <AlertDescription>Booking not found</AlertDescription>
            </Alert>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-muted/30 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Success Banner */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-lg text-muted-foreground">Your flight is booked and confirmed</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Confirmation */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Reference */}
              <Card className="p-6 bg-primary/5 border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                <p className="text-3xl font-bold text-primary">{booking.bookingReference}</p>
                <p className="text-xs text-muted-foreground mt-2">Save this reference for your records</p>
              </Card>

              {/* Flight Information */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Flight Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">{flightDetails.airline}</p>
                      <p className="text-2xl font-bold">{flightDetails.flightNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{flightDetails.from}</p>
                      <p className="text-sm text-muted-foreground">to</p>
                      <p className="font-semibold">{flightDetails.to}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Departure:</span>
                      <span className="font-semibold">{new Date(flightDetails.departureTime).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-semibold">{flightDetails.duration}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Passenger Information */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Passengers</h3>
                <div className="space-y-3">
                  {booking.passengers.map((passenger, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center pb-3 border-b last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-semibold">{passenger.name}</p>
                        <p className="text-sm text-muted-foreground">{passenger.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Seat</p>
                        <p className="text-lg font-bold text-primary">{booking.seats[index]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={handleDownloadItinerary} variant="outline" className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Download Itinerary
                </Button>
                <Link href="/" className="flex-1">
                  <Button className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div>
              <Card className="p-6 sticky top-4">
                <h3 className="font-bold text-lg mb-4">Booking Summary</h3>

                <div className="space-y-3 pb-4 border-b mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passengers</span>
                    <span className="font-medium">{booking.passengers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base fare</span>
                    <span className="font-medium">${(booking.totalPrice / booking.passengers.length).toFixed(0)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold">Total Paid</span>
                  <span className="text-2xl font-bold text-primary">${booking.totalPrice}</span>
                </div>

                <Alert className="bg-green-50 border-green-200 mb-4">
                  <MailOpen className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Confirmation sent to all passenger emails
                  </AlertDescription>
                </Alert>

                <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground text-center">
                  <p>Check in online 24 hours before departure</p>
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
