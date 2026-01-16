import { NextRequest, NextResponse } from "next/server"
import { RedisCLISessionStore } from "@/features/cli/data/RedisCLISessionStore"
import RedisKeyValueStore from "@/common/key-value-store/RedisKeyValueStore"
import { env } from "@/common"
import { CLISession, ICLISessionStore } from "@/features/cli/domain"

export interface CLIAuthContext {
  session: CLISession
  sessionStore: ICLISessionStore
}

export function getSessionFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }
  return null
}

export function createSessionStore(): ICLISessionStore {
  return new RedisCLISessionStore({
    store: new RedisKeyValueStore(env.getOrThrow("REDIS_URL"))
  })
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

    const sessionStore = createSessionStore()
    const session = await sessionStore.get(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    return handler(request, { session, sessionStore })
  }
}
