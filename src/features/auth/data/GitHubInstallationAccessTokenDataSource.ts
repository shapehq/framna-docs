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
    if (repositoryNames.length == 0) {
      throw new Error("Must provide at least one repository name when creating a GitHub installation access token.")
    }
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
    try {
      const installationAuth = await auth({
        type: "installation",
        installationId: installation.id,
        repositoryNames: repositoryNames
      })
      return installationAuth.token
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      if (error.status && error.status == 422) {
        // One or more of the repositories do not exist. We log the error
        // and create an access token with access to know repositories.
        console.error("Cannot log in user as one or more repositories do not exist: " + repositoryNames.join(", "))
        console.error(error)
      }
      throw error
    }
  }
}
