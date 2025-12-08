import IAzureDevOpsClient, {
  AzureDevOpsRepository,
  AzureDevOpsRef,
  AzureDevOpsItem
} from "./IAzureDevOpsClient"
import { AzureDevOpsError } from "./AzureDevOpsError"

interface IOAuthTokenDataSource {
  getOAuthToken(): Promise<{ accessToken: string }>
}

type AzureDevOpsApiResponse<T> = {
  value: T[]
  count: number
}

export default class AzureDevOpsClient implements IAzureDevOpsClient {
  private readonly organization: string
  private readonly oauthTokenDataSource: IOAuthTokenDataSource
  private readonly apiVersion = "7.1"

  constructor(config: {
    organization: string
    oauthTokenDataSource: IOAuthTokenDataSource
  }) {
    this.organization = config.organization
    this.oauthTokenDataSource = config.oauthTokenDataSource
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const oauthToken = await this.oauthTokenDataSource.getOAuthToken()
    const url = `https://dev.azure.com/${this.organization}${endpoint}`
    const separator = endpoint.includes("?") ? "&" : "?"
    const fullUrl = `${url}${separator}api-version=${this.apiVersion}`

    const response = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${oauthToken.accessToken}`,
        Accept: "application/json"
      },
      // Don't follow redirects - Azure DevOps returns 302 for auth failures
      redirect: "manual"
    })

    // Check for redirect (302) - Azure DevOps redirects to login on auth failure
    if (response.status === 302) {
      const location = response.headers.get("location") || ""
      // Check if redirecting to a sign-in page (auth error)
      const isAuthRedirect = location.includes("/_signin") || location.includes("/login")
      throw new AzureDevOpsError(
        `Azure DevOps API redirect (302) to: ${location}`,
        302,
        isAuthRedirect // only trigger token refresh for auth redirects
      )
    }

    // Check for authentication errors (401/403)
    if (response.status === 401 || response.status === 403) {
      const text = await response.text()
      throw new AzureDevOpsError(
        `Azure DevOps API authentication error: ${response.status} ${response.statusText} - ${text.substring(0, 200)}`,
        response.status,
        true // isAuthError - trigger token refresh
      )
    }

    if (!response.ok) {
      const text = await response.text()
      throw new AzureDevOpsError(
        `Azure DevOps API error: ${response.status} ${response.statusText} - ${text.substring(0, 200)}`,
        response.status,
        false
      )
    }

    return await response.json() as T
  }

  async getRepositories(): Promise<AzureDevOpsRepository[]> {
    const response = await this.fetch<AzureDevOpsApiResponse<AzureDevOpsRepository>>(
      "/_apis/git/repositories"
    )
    return response.value
  }

  async getRefs(repositoryId: string): Promise<AzureDevOpsRef[]> {
    const response = await this.fetch<AzureDevOpsApiResponse<AzureDevOpsRef>>(
      `/_apis/git/repositories/${repositoryId}/refs`
    )
    return response.value
  }

  async getItems(repositoryId: string, scopePath: string, version: string): Promise<AzureDevOpsItem[]> {
    try {
      const response = await this.fetch<AzureDevOpsApiResponse<AzureDevOpsItem>>(
        `/_apis/git/repositories/${repositoryId}/items?scopePath=${encodeURIComponent(scopePath)}&recursionLevel=OneLevel&versionDescriptor.version=${encodeURIComponent(version)}`
      )
      return response.value
    } catch {
      return []
    }
  }

  private isImageFile(path: string): boolean {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg", ".ico"]
    const lowerPath = path.toLowerCase()
    return imageExtensions.some(ext => lowerPath.endsWith(ext))
  }

  async getFileContent(repositoryId: string, path: string, version: string): Promise<string | ArrayBuffer | null> {
    try {
      const oauthToken = await this.oauthTokenDataSource.getOAuthToken()
      const url = `https://dev.azure.com/${this.organization}/_apis/git/repositories/${repositoryId}/items?path=${encodeURIComponent(path)}&versionDescriptor.version=${encodeURIComponent(version)}&api-version=${this.apiVersion}`

      const isImage = this.isImageFile(path)
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${oauthToken.accessToken}`,
          Accept: isImage ? "application/octet-stream" : "text/plain"
        }
      })

      if (!response.ok) {
        return null
      }

      if (isImage) {
        return await response.arrayBuffer()
      }
      return await response.text()
    } catch {
      return null
    }
  }
}
