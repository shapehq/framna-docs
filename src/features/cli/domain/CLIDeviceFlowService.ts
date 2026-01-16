import { createDeviceCode, exchangeDeviceCode } from "@octokit/oauth-methods"
import { ICLISessionStore } from "./ICLISessionStore"
import { CLISession } from "./CLISession"

export interface DeviceFlowInitiation {
  deviceCode: string
  userCode: string
  verificationUri: string
  expiresIn: number
  interval: number
  sessionId: string
}

interface CLIDeviceFlowServiceConfig {
  sessionStore: ICLISessionStore
  clientId: string
  clientSecret: string
}

export class CLIDeviceFlowService {
  private sessionStore: ICLISessionStore
  private clientId: string
  private clientSecret: string

  constructor(config: CLIDeviceFlowServiceConfig) {
    this.sessionStore = config.sessionStore
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
  }

  async getSessionToken(sessionId: string | undefined): Promise<CLISession | null> {
    if (!sessionId) return null
    return await this.sessionStore.get(sessionId)
  }

  async initiateDeviceFlow(): Promise<DeviceFlowInitiation> {
    const response = await createDeviceCode({
      clientType: "github-app",
      clientId: this.clientId,
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

  async pollForToken(deviceCode: string): Promise<CLISession | null> {
    const sessionId = await this.sessionStore.getPendingSession(deviceCode)
    if (!sessionId) return null

    try {
      const response = await exchangeDeviceCode({
        clientType: "github-app",
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        code: deviceCode,
      })

      const auth = response.authentication
      const session: CLISession = {
        sessionId,
        accessToken: auth.token,
        refreshToken: "refreshToken" in auth ? auth.refreshToken : undefined,
        expiresAt: "expiresAt" in auth ? auth.expiresAt : undefined,
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
