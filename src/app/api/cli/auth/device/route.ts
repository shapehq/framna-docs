import { NextResponse } from "next/server"
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

export async function POST(): Promise<NextResponse> {
  const result = await deviceFlowService.initiateDeviceFlow()

  return NextResponse.json({
    userCode: result.userCode,
    verificationUri: result.verificationUri,
    deviceCode: result.deviceCode,
    sessionId: result.sessionId,
    expiresIn: result.expiresIn,
    interval: result.interval,
  })
}
