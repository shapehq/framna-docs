import { NextRequest, NextResponse } from "next/server"
import { MCPDeviceFlowService } from "@/features/mcp/domain"
import { RedisMCPSessionStore } from "@/features/mcp/data"
import RedisKeyValueStore from "@/common/key-value-store/RedisKeyValueStore"
import { env } from "@/common"

const sessionStore = new RedisMCPSessionStore({
  store: new RedisKeyValueStore(env.getOrThrow("REDIS_URL"))
})

const deviceFlowService = new MCPDeviceFlowService({
  sessionStore,
  clientId: env.getOrThrow("GITHUB_CLIENT_ID"),
})

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const deviceCode = url.searchParams.get("device_code")

  if (!deviceCode) {
    return NextResponse.json(
      { error: "device_code query parameter required" },
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
