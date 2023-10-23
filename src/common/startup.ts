import AccessTokenService from "@/features/auth/domain/AccessTokenService"
import Auth0RefreshTokenReader from "@/features/auth/data/Auth0RefreshTokenReader"
import Auth0SessionOAuthTokenRepository from "@/features/auth/data/Auth0SessionOAuthTokenRepository"
import GitHubClient from "@/common/github/GitHubClient"
import GitHubOAuthTokenRefresher from "@/features/auth/data/GitHubOAuthTokenRefresher"
import GitHubProjectRepository from "@/features/projects/data/GitHubProjectRepository"
import InitialOAuthTokenService from "@/features/auth/domain/InitialOAuthTokenService"
import KeyValueOAuthTokenRepository from "@/features/auth/domain/KeyValueOAuthTokenRepository"
import RedisKeyValueStore from "./caching/RedisKeyValueStore"

const {
  AUTH0_MANAGEMENT_DOMAIN,
  AUTH0_MANAGEMENT_CLIENT_ID,
  AUTH0_MANAGEMENT_CLIENT_SECRET,
  GITHUB_APP_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_PRIVATE_KEY_BASE_64,
  GITHUB_ORGANIZATION_NAME,
  REDIS_URL
} = process.env

const gitHubPrivateKey = Buffer.from(GITHUB_PRIVATE_KEY_BASE_64, "base64").toString("utf-8")

const oAuthTokenRepository = new KeyValueOAuthTokenRepository(
  new RedisKeyValueStore(REDIS_URL)
)

export const sessionOAuthTokenRepository = new Auth0SessionOAuthTokenRepository(
  oAuthTokenRepository
)

const gitHubOAuthTokenRefresher = new GitHubOAuthTokenRefresher({
  clientId: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET
})

const accessTokenService = new AccessTokenService(
  sessionOAuthTokenRepository,
  gitHubOAuthTokenRefresher
)

export const gitHubClient = new GitHubClient({
  appId: GITHUB_APP_ID,
  clientId: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  privateKey: gitHubPrivateKey,
  accessTokenReader: accessTokenService
})

export const projectRepository = new GitHubProjectRepository(
  gitHubClient,
  GITHUB_ORGANIZATION_NAME
)

export const initialOAuthTokenService = new InitialOAuthTokenService({
  refreshTokenReader: new Auth0RefreshTokenReader({
    domain: AUTH0_MANAGEMENT_DOMAIN,
    clientId: AUTH0_MANAGEMENT_CLIENT_ID,
    clientSecret: AUTH0_MANAGEMENT_CLIENT_SECRET,
    connection: "github"
  }),
  oAuthTokenRefresher: gitHubOAuthTokenRefresher,
  oAuthTokenRepository: oAuthTokenRepository
})
