import { createDeviceCode, exchangeDeviceCode } from "@octokit/oauth-methods"
import { IMCPSessionStore, MCPSession } from "./index"

export interface DeviceFlowInitiation {
  deviceCode: string
  userCode: string
  verificationUri: string
  expiresIn: number
  interval: number
  sessionId: string
}

interface MCPDeviceFlowServiceConfig {
  sessionStore: IMCPSessionStore
  clientId: string
  scopes?: string[]
}

export class MCPDeviceFlowService {
  private sessionStore: IMCPSessionStore
  private clientId: string
  private scopes: string[]

  constructor(config: MCPDeviceFlowServiceConfig) {
    this.sessionStore = config.sessionStore
    this.clientId = config.clientId
    this.scopes = config.scopes || ["repo", "read:org", "read:user"]
  }

  async getSessionToken(sessionId: string | undefined): Promise<MCPSession | null> {
    if (!sessionId) return null
    return await this.sessionStore.get(sessionId)
  }

  async initiateDeviceFlow(): Promise<DeviceFlowInitiation> {
    const response = await createDeviceCode({
      clientType: "oauth-app",
      clientId: this.clientId,
      scopes: this.scopes,
    })

    const sessionId = await this.sessionStore.createPendingSession(response.data.device_code)

    return {
      deviceCode: response.data.device_code,
      userCode: response.data.user_code,
      verificationUri: response.data.verification_uri,
      expiresIn: response.data.expires_in,
      interval: response.data.interval,
      sessionId,
    }
  }

  async pollForToken(deviceCode: string): Promise<MCPSession | null> {
    const sessionId = await this.sessionStore.getPendingSession(deviceCode)
    if (!sessionId) return null

    try {
      const response = await exchangeDeviceCode({
        clientType: "oauth-app",
        clientId: this.clientId,
        code: deviceCode,
      })

      const session: MCPSession = {
        sessionId,
        accessToken: response.authentication.token,
        refreshToken: (response.authentication as { refreshToken?: string }).refreshToken,
        expiresAt: (response.authentication as { expiresAt?: string }).expiresAt,
        createdAt: new Date().toISOString(),
      }

      await this.sessionStore.completePendingSession(deviceCode, session)
      return session
    } catch (error) {
      // Check for authorization_pending or slow_down errors
      const errorMessage = String(error)
      if (errorMessage.includes("authorization_pending") ||
          errorMessage.includes("slow_down")) {
        return null
      }
      throw error
    }
  }
}
