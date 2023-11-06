import AccessTokenRefreshingGitHubClient from "@/common/github/AccessTokenRefreshingGitHubClient"
import Auth0RefreshTokenReader from "@/features/auth/data/Auth0RefreshTokenReader"
import Auth0Session from "@/common/session/Auth0Session"
import CachingProjectDataSource from "@/features/projects/domain/CachingProjectDataSource"
import GitHubClient from "@/common/github/GitHubClient"
import GitHubOAuthTokenRefresher from "@/features/auth/data/GitHubOAuthTokenRefresher"
import GitHubOrganizationSessionValidator from "@/common/session/GitHubOrganizationSessionValidator"
import GitHubProjectDataSource from "@/features/projects/data/GitHubProjectDataSource"
import KeyValueUserDataRepository from "@/common/userData/KeyValueUserDataRepository"
import LockingAccessTokenRefresher from "@/features/auth/domain/LockingAccessTokenRefresher"
import OAuthTokenTransferer from "@/features/auth/domain/OAuthTokenTransferer"
import RedisKeyedMutexFactory from "@/common/mutex/RedisKeyedMutexFactory"
import RedisKeyValueStore from "@/common/keyValueStore/RedisKeyValueStore"
import SessionAccessTokenReader from "@/features/auth/domain/SessionAccessTokenReader"
import SessionDataRepository from "@/common/userData/SessionDataRepository"
import SessionMutexFactory from "@/common/mutex/SessionMutexFactory"
import SessionOAuthTokenRepository from "@/features/auth/domain/SessionOAuthTokenRepository"
import SessionProjectRepository from "@/features/projects/domain/SessionProjectRepository"
import SessionValidatingProjectDataSource from "@/features/projects/domain/SessionValidatingProjectDataSource"
import OAuthTokenRepository from "@/features/auth/domain/OAuthTokenRepository"
import authLogoutHandler from "@/common/authHandler/logout"

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

const oAuthTokenRepository = new KeyValueUserDataRepository(
  new RedisKeyValueStore(REDIS_URL),
  "authToken"
)

export const sessionOAuthTokenRepository = new SessionOAuthTokenRepository(
  new SessionDataRepository(new Auth0Session(), oAuthTokenRepository)
)

const gitHubOAuthTokenRefresher = new GitHubOAuthTokenRefresher({
  clientId: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET
})

export const gitHubClient = new AccessTokenRefreshingGitHubClient(
  new SessionAccessTokenReader(
    sessionOAuthTokenRepository
  ),
  new LockingAccessTokenRefresher(
    new SessionMutexFactory(
      new RedisKeyedMutexFactory(REDIS_URL),
      new Auth0Session(),
      "mutexAccessToken"
    ),
    sessionOAuthTokenRepository,
    gitHubOAuthTokenRefresher
  ),
  new GitHubClient({
    appId: GITHUB_APP_ID,
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    privateKey: gitHubPrivateKey,
    accessTokenReader: new SessionAccessTokenReader(
      sessionOAuthTokenRepository
    )
  })
)

export const sessionValidator = new GitHubOrganizationSessionValidator(
  gitHubClient,
  GITHUB_ORGANIZATION_NAME
)

export const sessionProjectRepository = new SessionProjectRepository(
  new SessionDataRepository(
    new Auth0Session(),
    new KeyValueUserDataRepository(
      new RedisKeyValueStore(REDIS_URL),
      "projects"
    )
  )
)

export const projectDataSource = new CachingProjectDataSource(
  new SessionValidatingProjectDataSource(
    sessionValidator,
    new GitHubProjectDataSource(
      gitHubClient,
      GITHUB_ORGANIZATION_NAME
    )
  ),
  sessionProjectRepository
)

export const oAuthTokenTransferer = new OAuthTokenTransferer({
  refreshTokenReader: new Auth0RefreshTokenReader({
    domain: AUTH0_MANAGEMENT_DOMAIN,
    clientId: AUTH0_MANAGEMENT_CLIENT_ID,
    clientSecret: AUTH0_MANAGEMENT_CLIENT_SECRET,
    connection: "github"
  }),
  oAuthTokenRefresher: gitHubOAuthTokenRefresher,
  oAuthTokenRepository: new OAuthTokenRepository(oAuthTokenRepository)
})

export const logoutHandler = async () => {
  await authLogoutHandler(sessionOAuthTokenRepository, sessionProjectRepository)
}
