import { UnauthorizedError } from "@/common"
import { OAuthToken, IOAuthTokenRefresher } from "../domain"

// Microsoft's registered Application ID for Azure DevOps
const AZURE_DEVOPS_RESOURCE_ID = "499b84ac-1321-427f-aa17-267ca6975798"

export interface AzureDevOpsOAuthTokenRefresherConfig {
  readonly clientId: string
  readonly clientSecret: string
  readonly tenantId: string
}

type TokenResponse = {
  access_token?: string
  refresh_token?: string
  error?: string
  error_description?: string
}

/**
 * Refreshes OAuth tokens using Microsoft Entra ID (Azure AD) token endpoint.
 */
export default class AzureDevOpsOAuthTokenRefresher implements IOAuthTokenRefresher {
  private readonly config: AzureDevOpsOAuthTokenRefresherConfig

  constructor(config: AzureDevOpsOAuthTokenRefresherConfig) {
    this.config = config
  }

  async refreshOAuthToken(oldOAuthToken: OAuthToken): Promise<OAuthToken> {
    if (!oldOAuthToken.refreshToken) {
      throw new Error("Cannot refresh OAuth token as it has no refresh token")
    }

    // Use Microsoft Entra ID token endpoint
    const url = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`
    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: "refresh_token",
      refresh_token: oldOAuthToken.refreshToken,
      // Request Azure DevOps API access
      scope: `${AZURE_DEVOPS_RESOURCE_ID}/.default offline_access`
    })

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    })

    if (response.status !== 200) {
      throw new UnauthorizedError(
        `Failed refreshing access token with HTTP status ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json() as TokenResponse

    if (data.error) {
      throw new UnauthorizedError(data.error_description || data.error)
    }

    const accessToken = data.access_token
    const refreshToken = data.refresh_token

    if (!accessToken || accessToken.length <= 0) {
      throw new UnauthorizedError("Refreshing access token did not produce a valid access token")
    }

    return {
      accessToken,
      refreshToken: refreshToken || oldOAuthToken.refreshToken
    }
  }
}
