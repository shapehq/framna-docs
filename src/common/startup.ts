import Auth0OAuthTokenRepository from "@/features/auth/data/Auth0OAuthTokenRepository"
import GitHubOAuthTokenRefresher from "@/features/auth/data/GitHubOAuthTokenRefresher"
import AccessTokenService from "@/features/auth/domain/AccessTokenService"
import HardcodedGitHubOrganizationNameProvider from "@/features/projects/data/HardcodedGitHubOrganizationNameProvider"
import GitHubProjectRepository from "@/features/projects/data/GitHubProjectRepository"

export const accessTokenService = new AccessTokenService(
  new Auth0OAuthTokenRepository({
    domain: process.env.AUTH0_MANAGEMENT_DOMAIN,
    clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
    clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    connection: "github"
  }),
  new GitHubOAuthTokenRefresher({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET
  })
)

export const projectRepository = new GitHubProjectRepository(
  new HardcodedGitHubOrganizationNameProvider("shapehq"),
  accessTokenService
)
