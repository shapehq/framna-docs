import { NextRequest, NextResponse } from "next/server"
import { RedisMCPSessionStore } from "@/features/mcp/data/RedisMCPSessionStore"
import RedisKeyValueStore from "@/common/key-value-store/RedisKeyValueStore"
import { env } from "@/common"

export interface CLIAuthContext {
  sessionId: string
  accessToken: string
}

export function getSessionFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }
  return null
}

export function withAuth<T>(
  handler: (request: NextRequest, auth: CLIAuthContext) => Promise<NextResponse<T>>
): (request: NextRequest) => Promise<NextResponse<T | { error: string }>> {
  return async (request: NextRequest) => {
    const sessionId = getSessionFromRequest(request)

    if (!sessionId) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      )
    }

    const store = new RedisMCPSessionStore({
      store: new RedisKeyValueStore(env.getOrThrow("REDIS_URL"))
    })

    const session = await store.get(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    return handler(request, {
      sessionId: session.sessionId,
      accessToken: session.accessToken,
    })
  }
}
