import IAzureDevOpsClient, {
  AzureDevOpsRepository,
  AzureDevOpsRef,
  AzureDevOpsItem
} from "./IAzureDevOpsClient"
import { AzureDevOpsError } from "./AzureDevOpsError"

type OAuthToken = { accessToken: string, refreshToken?: string }

interface IOAuthTokenDataSource {
  getOAuthToken(): Promise<OAuthToken>
}

interface IOAuthTokenRefresher {
  refreshOAuthToken(oauthToken: OAuthToken): Promise<OAuthToken>
}

/**
 * Wraps an Azure DevOps client and automatically refreshes OAuth tokens
 * when authentication errors occur.
 */
export default class OAuthTokenRefreshingAzureDevOpsClient implements IAzureDevOpsClient {
  private readonly oauthTokenDataSource: IOAuthTokenDataSource
  private readonly oauthTokenRefresher: IOAuthTokenRefresher
  private readonly client: IAzureDevOpsClient

  constructor(config: {
    oauthTokenDataSource: IOAuthTokenDataSource
    oauthTokenRefresher: IOAuthTokenRefresher
    client: IAzureDevOpsClient
  }) {
    this.oauthTokenDataSource = config.oauthTokenDataSource
    this.oauthTokenRefresher = config.oauthTokenRefresher
    this.client = config.client
  }

  async getRepositories(): Promise<AzureDevOpsRepository[]> {
    return await this.send(async () => {
      return await this.client.getRepositories()
    })
  }

  async getRefs(repositoryId: string): Promise<AzureDevOpsRef[]> {
    return await this.send(async () => {
      return await this.client.getRefs(repositoryId)
    })
  }

  async getItems(repositoryId: string, scopePath: string, version: string): Promise<AzureDevOpsItem[]> {
    return await this.send(async () => {
      return await this.client.getItems(repositoryId, scopePath, version)
    })
  }

  async getFileContent(repositoryId: string, path: string, version: string): Promise<string | ArrayBuffer | null> {
    return await this.send(async () => {
      return await this.client.getFileContent(repositoryId, path, version)
    })
  }

  private async send<T>(fn: () => Promise<T>): Promise<T> {
    const oauthToken = await this.oauthTokenDataSource.getOAuthToken()
    try {
      return await fn()
    } catch (e) {
      // Check if this is an authentication error that we can recover from
      if (e instanceof AzureDevOpsError && e.isAuthError) {
        // Refresh access token and try the request one last time
        await this.oauthTokenRefresher.refreshOAuthToken(oauthToken)
        return await fn()
      }
      // Not an error we can handle so forward it
      throw e
    }
  }
}
