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

export async function GET(req: NextRequest) {
  const deviceCode = req.nextUrl.searchParams.get("device_code")

  if (!deviceCode) {
    return NextResponse.json({ error: "device_code required" }, { status: 400 })
  }

  try {
    const session = await deviceFlowService.pollForToken(deviceCode)

    if (!session) {
      return NextResponse.json({
        status: "pending",
        message: "Authorization pending. User has not yet completed authentication."
      })
    }

    return NextResponse.json({
      status: "complete",
      sessionId: session.sessionId,
      message: "Authentication successful. Use sessionId in mcp-session-id header.",
    })
  } catch (error) {
    const errorMessage = String(error)

    // Check for common OAuth errors
    if (errorMessage.includes("expired_token") || errorMessage.includes("access_denied")) {
      return NextResponse.json({
        status: "error",
        error: "Authentication expired or denied. Please start a new authentication flow."
      }, { status: 400 })
    }

    return NextResponse.json({
      status: "error",
      error: errorMessage
    }, { status: 500 })
  }
}
