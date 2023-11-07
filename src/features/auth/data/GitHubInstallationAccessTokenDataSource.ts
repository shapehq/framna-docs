import { Octokit } from "octokit"
import { createAppAuth } from "@octokit/auth-app"

type GitHubInstallationAccessTokenRefresherConfig = {
  readonly appId: string
  readonly clientId: string
  readonly clientSecret: string
  readonly privateKey: string
  readonly organization: string
}

export default class GitHubInstallationAccessTokenRefresher {
  private readonly config: GitHubInstallationAccessTokenRefresherConfig
  
  constructor(config: GitHubInstallationAccessTokenRefresherConfig) {
    this.config = config
  }
  
  async getAccessToken(repositoryNames: string[]): Promise<string> {
    const auth = createAppAuth({
      appId: this.config.appId,
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      privateKey: this.config.privateKey
    })
    const appAuth = await auth({ type: "app" })
    const octokit = new Octokit({ auth: appAuth.token })
    const response = await octokit.rest.apps.getOrgInstallation({
      org: this.config.organization
    })
    const installation = response.data
    const installationAuth = await auth({
      type: "installation",
      installationId: installation.id,
      repositoryNames: repositoryNames
    })
    return installationAuth.token
  }
}
