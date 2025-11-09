"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Plane, Search, MapPin, Calendar } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("round-trip")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [departDate, setDepartDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [passengers, setPassengers] = useState(1)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({
      from,
      to,
      departDate,
      returnDate,
      passengers: passengers.toString(),
    })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Book Your Next Flight with SkyEase</h1>
          <p className="text-lg text-primary-foreground/90 mb-8 text-pretty">
            Find the best deals on flights and travel with confidence
          </p>
        </div>
      </section>

      {/* Search Form */}
      <section className="bg-background py-12 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="p-8 shadow-lg">
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Trip Type */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="round-trip"
                    checked={tripType === "round-trip"}
                    onChange={(e) => setTripType(e.target.value as "round-trip")}
                  />
                  <span className="text-sm font-medium">Round Trip</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="one-way"
                    checked={tripType === "one-way"}
                    onChange={(e) => setTripType(e.target.value as "one-way")}
                  />
                  <span className="text-sm font-medium">One Way</span>
                </label>
              </div>

              {/* Search Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    From
                  </label>
                  <Input
                    placeholder="e.g., New York (JFK)"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    To
                  </label>
                  <Input placeholder="e.g., London (LHR)" value={to} onChange={(e) => setTo(e.target.value)} required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Depart
                  </label>
                  <Input type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)} required />
                </div>

                {tripType === "round-trip" && (
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Return
                    </label>
                    <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Passengers</label>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number.parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Passenger" : "Passengers"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full md:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Search Flights
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose SkyEase?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <Plane className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-bold text-lg mb-2">Best Prices</h3>
              <p className="text-muted-foreground">Find the lowest fares from all airlines in one place</p>
            </Card>

            <Card className="p-6 text-center">
              <Search className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-bold text-lg mb-2">Easy Booking</h3>
              <p className="text-muted-foreground">Simple and secure booking process in minutes</p>
            </Card>

            <Card className="p-6 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-bold text-lg mb-2">Global Coverage</h3>
              <p className="text-muted-foreground">Flights to over 1000 destinations worldwide</p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
