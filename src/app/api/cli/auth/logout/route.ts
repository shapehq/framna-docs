import { NextRequest, NextResponse } from "next/server"
import { RedisCLISessionStore } from "@/features/cli/data"
import RedisKeyValueStore from "@/common/key-value-store/RedisKeyValueStore"
import { env } from "@/common"

function getSessionId(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }
  return null
}

const sessionStore = new RedisCLISessionStore({
  store: new RedisKeyValueStore(env.getOrThrow("REDIS_URL"))
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const sessionId = getSessionId(request)

  if (!sessionId) {
    return NextResponse.json(
      { error: "Authorization header required" },
      { status: 401 }
    )
  }

  await sessionStore.delete(sessionId)

  return NextResponse.json({ success: true })
}
