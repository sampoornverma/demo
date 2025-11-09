import { type NextRequest, NextResponse } from "next/server"

// Mock user database (in production, this would be a real database)
const users: Array<{ id: string; name: string; email: string; password: string }> = [
  { id: "1", name: "John Doe", email: "john@example.com", password: "password123" },
]

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    if (users.some((u) => u.email === email)) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: String(users.length + 1),
      name,
      email,
      password,
    }

    users.push(newUser)

    // Generate a mock token (in production, use JWT)
    const token = Buffer.from(`${newUser.id}:${newUser.email}:${Date.now()}`).toString("base64")

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({ user: userWithoutPassword, token }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
