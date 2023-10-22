import { ManagementClient } from "auth0"
import { getSession } from "@auth0/nextjs-auth0"
import IOAuthTokenRepository, { IOAuthToken } from "../domain/IOAuthTokenRepository"

type Auth0User = {
  readonly user_id: string
  readonly identities: Auth0UserIdentity[]
  readonly app_metadata?: Auth0UserAppMetadata
}

type Auth0UserAppMetadata = {[key: string]: Auth0UserAppMetadataAuthToken | undefined}

type Auth0UserAppMetadataAuthToken = {
  readonly access_token: string
  readonly refresh_token: string
  readonly access_token_expires_at: string
  readonly refresh_token_expires_at: string
}

type Auth0UserIdentity = {
  readonly connection: string
  readonly access_token: string
  readonly refresh_token: string
}

interface Auth0OAuthIdentityProviderConfig {
  readonly domain: string
  readonly clientId: string
  readonly clientSecret: string
  readonly connection: string
}

export default class Auth0OAuthTokenRepository implements IOAuthTokenRepository {
  private readonly managementClient: ManagementClient
  private readonly connection: string
  
  constructor(config: Auth0OAuthIdentityProviderConfig) {
    this.connection = config.connection
    this.managementClient = new ManagementClient({
      domain: config.domain,
      clientId: config.clientId,
      clientSecret: config.clientSecret
    })
  }
  
  async getOAuthToken(): Promise<IOAuthToken> {
    const user = await this.getUser()
    const metadataAuthToken = this.getAuthTokenFromMetadata(user)
    if (!metadataAuthToken) {
      return this.getDefaultAuth0AuthToken(user)
    }
    const accessTokenExpiryDate = new Date(metadataAuthToken.access_token_expires_at)
    const refreshTokenExpiryDate = new Date(metadataAuthToken.refresh_token_expires_at)
    const now = new Date()
    if (refreshTokenExpiryDate.getTime() <= now.getTime()) {
      return this.getDefaultAuth0AuthToken(user)
    }
    return {
      accessToken: metadataAuthToken.access_token,
      refreshToken: metadataAuthToken.refresh_token,
      accessTokenExpiryDate: accessTokenExpiryDate,
      refreshTokenExpiryDate: refreshTokenExpiryDate
    }
  }
  
  async storeOAuthToken(token: IOAuthToken): Promise<void> {
    const user = await this.getUser()
    const authTokenKey = this.getAuthTokenMetadataKey(this.connection)
    const appMetadataToken: Auth0UserAppMetadataAuthToken = {
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      access_token_expires_at: token.accessTokenExpiryDate.toISOString(),
      refresh_token_expires_at: token.refreshTokenExpiryDate.toISOString()
    }
    const appMetadata: Auth0UserAppMetadata = {}
    appMetadata[authTokenKey] = appMetadataToken
    await this.managementClient.users.update({ id: user.user_id }, {
      app_metadata: appMetadata
    })
  }
  
  private async getDefaultAuth0AuthToken(user: Auth0User) {
    const identity = this.getIdentity(user)
    if (!identity) {
      throw new Error("User have no identities")
    }
    return {
      accessToken: identity.access_token,
      refreshToken: identity.refresh_token,
      accessTokenExpiryDate: new Date(new Date().getTime() - 30 * 60 * 1000),
      refreshTokenExpiryDate: new Date(new Date().getTime() + 30 * 60 * 1000)
    }
  }
  
  private getIdentity(user: Auth0User): Auth0UserIdentity | undefined {
    if (!user.identities) {
      return undefined
    }
    return user.identities.find(e => {
      return e.connection.toLowerCase() === this.connection.toLowerCase()
    })
  }
  
  private getAuthTokenFromMetadata(user: Auth0User): Auth0UserAppMetadataAuthToken | undefined {
    if (!user.app_metadata) {
      return undefined
    }
    const authTokenKey = this.getAuthTokenMetadataKey(this.connection)
    const authToken = user.app_metadata[authTokenKey]
    if (
      authToken &&
      authToken.access_token && authToken.access_token.length > 0 &&
      authToken.refresh_token && authToken.refresh_token.length > 0 &&
      authToken.access_token_expires_at && authToken.access_token_expires_at.length > 0 &&
      authToken.refresh_token_expires_at && authToken.refresh_token_expires_at.length > 0
    ) {
      return authToken
    } else {
      return undefined
    }
  }
  
  private getAuthTokenMetadataKey(connection: string): string {
    return `authToken[${connection.toLowerCase()}]`
  }
  
  private async getUser(): Promise<Auth0User> {
    const session = await getSession()
    const user = session?.user
    if (!user) {
      throw new Error("User is not authenticated")
    }
    const userResponse = await this.managementClient.users.get({ id: user.sub })
    return userResponse.data
  }
}
