import AccessTokenRefreshingGitHubClient from "@/common/github/AccessTokenRefreshingGitHubClient"
import AccessTokenService from "@/features/auth/domain/accessToken/AccessTokenService"
import Auth0RefreshTokenReader from "@/features/auth/data/Auth0RefreshTokenReader"
import Auth0Session from "@/common/session/Auth0Session"
import CachingProjectDataSource from "@/features/projects/domain/CachingProjectDataSource"
import CompositeLogOutHandler from "@/features/auth/domain/logOut/CompositeLogOutHandler"
import ErrorIgnoringLogOutHandler from "@/features/auth/domain/logOut/ErrorIgnoringLogOutHandler"
import GitHubClient from "@/common/github/GitHubClient"
import GitHubOAuthTokenRefresher from "@/features/auth/data/GitHubOAuthTokenRefresher"
import GitHubOrganizationSessionValidator from "@/common/session/GitHubOrganizationSessionValidator"
import GitHubProjectDataSource from "@/features/projects/data/GitHubProjectDataSource"
import InitialOAuthTokenService from "@/features/auth/domain/oAuthToken/InitialOAuthTokenService"
import KeyValueUserDataRepository from "@/common/userData/KeyValueUserDataRepository"
import LockingAccessTokenService from "@/features/auth/domain/accessToken/LockingAccessTokenService"
import OnlyStaleRefreshingAccessTokenService from "@/features/auth/domain/accessToken/OnlyStaleRefreshingAccessTokenService"
import ProjectRepository from "@/features/projects/domain/ProjectRepository"
import RedisKeyedMutexFactory from "@/common/mutex/RedisKeyedMutexFactory"
import RedisKeyValueStore from "@/common/keyValueStore/RedisKeyValueStore"
import SessionMutexFactory from "@/common/mutex/SessionMutexFactory"
import SessionValidatingProjectDataSource from "@/features/projects/domain/SessionValidatingProjectDataSource"
import OAuthTokenRepository from "@/features/auth/domain/oAuthToken/OAuthTokenRepository"
import UserDataCleanUpLogOutHandler from "@/features/auth/domain/logOut/UserDataCleanUpLogOutHandler"

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

export const session = new Auth0Session()

export const oAuthTokenRepository = new OAuthTokenRepository(
  new KeyValueUserDataRepository(
    new RedisKeyValueStore(REDIS_URL),
    "authToken"
  )
)

const accessTokenService = new LockingAccessTokenService(
  new SessionMutexFactory(
    new RedisKeyedMutexFactory(REDIS_URL),
    session,
    "mutexAccessToken"
  ),
  new OnlyStaleRefreshingAccessTokenService(
    new AccessTokenService({
      userIdReader: session,
      repository: oAuthTokenRepository,
      refresher: new GitHubOAuthTokenRefresher({
        clientId: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET
      })
    })
  )
)

export const gitHubClient = new AccessTokenRefreshingGitHubClient(
  accessTokenService,
  new GitHubClient({
    appId: GITHUB_APP_ID,
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    privateKey: gitHubPrivateKey,
    accessTokenReader: accessTokenService
  })
)

export const sessionValidator = new GitHubOrganizationSessionValidator(
  gitHubClient,
  GITHUB_ORGANIZATION_NAME
)

const projectUserDataRepository = new KeyValueUserDataRepository(
  new RedisKeyValueStore(REDIS_URL),
  "projects"
)

export const projectRepository = new ProjectRepository(
  session,
  projectUserDataRepository
)

export const projectDataSource = new CachingProjectDataSource(
  new SessionValidatingProjectDataSource(
    sessionValidator,
    new GitHubProjectDataSource(
      gitHubClient,
      GITHUB_ORGANIZATION_NAME
    )
  ),
  projectRepository
)

export const initialOAuthTokenService = new InitialOAuthTokenService({
  refreshTokenReader: new Auth0RefreshTokenReader({
    domain: AUTH0_MANAGEMENT_DOMAIN,
    clientId: AUTH0_MANAGEMENT_CLIENT_ID,
    clientSecret: AUTH0_MANAGEMENT_CLIENT_SECRET,
    connection: "github"
  }),
  oAuthTokenRefresher: new GitHubOAuthTokenRefresher({
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET
  }),
  oAuthTokenRepository: oAuthTokenRepository
})

export const logOutHandler = new ErrorIgnoringLogOutHandler(
  new CompositeLogOutHandler([
    new UserDataCleanUpLogOutHandler(session, projectUserDataRepository),
    new UserDataCleanUpLogOutHandler(session, oAuthTokenRepository)
  ])
)
