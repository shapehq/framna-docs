import { NextRequest, NextResponse } from "next/server"
import { CLIDeviceFlowService } from "@/features/cli/domain"
import { RedisCLISessionStore } from "@/features/cli/data"
import RedisKeyValueStore from "@/common/key-value-store/RedisKeyValueStore"
import { env } from "@/common"

const sessionStore = new RedisCLISessionStore({
  store: new RedisKeyValueStore(env.getOrThrow("REDIS_URL"))
})

const deviceFlowService = new CLIDeviceFlowService({
  sessionStore,
  clientId: env.getOrThrow("GITHUB_CLIENT_ID"),
  clientSecret: env.getOrThrow("GITHUB_CLIENT_SECRET"),
})

// Rate limiting: max 1 request per 5 seconds per IP
const RATE_LIMIT_WINDOW_MS = 5000
const rateLimitMap = new Map<string, number>()

// Cleanup stale entries periodically (every 60 seconds)
setInterval(() => {
  const now = Date.now()
  const entries = Array.from(rateLimitMap.entries())
  for (let i = 0; i < entries.length; i++) {
    const [ip, timestamp] = entries[i]
    if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip)
    }
  }
}, 60000)

function getClientIP(request: NextRequest): string {
  // Check common proxy headers
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP
  }
  // Fallback to a default value for local development
  return "127.0.0.1"
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const lastRequest = rateLimitMap.get(ip)

  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW_MS) {
    return false // Rate limited
  }

  rateLimitMap.set(ip, now)
  return true // Allowed
}

interface StatusRequestBody {
  device_code?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Apply rate limiting
  const clientIP = getClientIP(request)
  if (!checkRateLimit(clientIP)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait 5 seconds between requests." },
      { status: 429 }
    )
  }

  let body: StatusRequestBody
  try {
    body = await request.json() as StatusRequestBody
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const deviceCode = body.device_code

  if (!deviceCode) {
    return NextResponse.json(
      { error: "device_code required in request body" },
      { status: 400 }
    )
  }

  try {
    const session = await deviceFlowService.pollForToken(deviceCode)

    if (!session) {
      return NextResponse.json({ status: "pending" })
    }

    return NextResponse.json({
      status: "complete",
      sessionId: session.sessionId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ status: "error", error: message }, { status: 500 })
  }
}

// Export for testing
export { checkRateLimit, rateLimitMap, getClientIP }
