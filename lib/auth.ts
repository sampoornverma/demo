import { users } from "./db"

// Simple password hashing (in production, use bcryptjs)
export function hashPassword(password: string): string {
  return Buffer.from(password).toString("base64")
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// JWT-like token generation (simplified for demo)
export function generateToken(userId: string): string {
  return Buffer.from(JSON.stringify({ userId, iat: Date.now() })).toString("base64")
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())
    return decoded.userId
  } catch {
    return null
  }
}

export function registerUser(email: string, password: string, name: string) {
  if (Array.from(users.values()).some((u) => u.email === email)) {
    throw new Error("User already exists")
  }

  const userId = "user_" + Date.now()
  const user = {
    id: userId,
    email,
    password: hashPassword(password),
    name,
    createdAt: new Date(),
  }

  users.set(userId, user)
  return { id: userId, email, name }
}

export function loginUser(email: string, password: string) {
  const user = Array.from(users.values()).find((u) => u.email === email)
  if (!user || !verifyPassword(password, user.password)) {
    throw new Error("Invalid email or password")
  }

  const token = generateToken(user.id)
  return { id: user.id, email: user.email, name: user.name, token }
}
