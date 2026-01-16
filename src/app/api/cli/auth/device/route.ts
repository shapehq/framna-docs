import { NextResponse } from "next/server"
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

export async function POST(): Promise<NextResponse> {
  try {
    const result = await deviceFlowService.initiateDeviceFlow()

    return NextResponse.json({
      userCode: result.userCode,
      verificationUri: result.verificationUri,
      deviceCode: result.deviceCode,
      sessionId: result.sessionId,
      expiresIn: result.expiresIn,
      interval: result.interval,
    })
  } catch (error) {
    console.error("Device flow initiation failed:", error)
    return NextResponse.json(
      { error: "Failed to initiate device flow" },
      { status: 500 }
    )
  }
}
