import { flights } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  let results = Array.from(flights.values())

  if (from) {
    results = results.filter((f) => f.from.toLowerCase().includes(from.toLowerCase()))
  }

  if (to) {
    results = results.filter((f) => f.to.toLowerCase().includes(to.toLowerCase()))
  }

  return NextResponse.json(results)
}
