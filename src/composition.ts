import {
  AccessTokenRefreshingGitHubClient,
  Auth0Session,
  GitHubClient,
  GitHubOrganizationSessionValidator,
  KeyValueUserDataRepository,
  RedisKeyedMutexFactory,
  RedisKeyValueStore,
  SessionMutexFactory
} from "@/common"
import {
  Auth0RefreshTokenReader,
  GitHubOAuthTokenRefresher
} from "@/features/auth/data"
import {
  AccessTokenService,
  CompositeLogOutHandler,
  CredentialsTransferrer,
  CredentialsTransferringLogInHandler,
  ErrorIgnoringLogOutHandler,
  LockingAccessTokenService,
  OnlyStaleRefreshingAccessTokenService,
  OAuthTokenRepository,
  UserDataCleanUpLogOutHandler
} from "@/features/auth/domain"
import {
  GitHubProjectDataSource
} from "@/features/projects/data"
import {
  CachingProjectDataSource,
  ProjectRepository,
  SessionValidatingProjectDataSource
} from "@/features/projects/domain"

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

export const gitHubClient = new GitHubClient({
  appId: GITHUB_APP_ID,
  clientId: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  privateKey: gitHubPrivateKey,
  accessTokenReader: accessTokenService
})

const userGitHubClient = new AccessTokenRefreshingGitHubClient(
  accessTokenService,
  gitHubClient
)

export const sessionValidator = new GitHubOrganizationSessionValidator(
  userGitHubClient,
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
      userGitHubClient,
      GITHUB_ORGANIZATION_NAME
    )
  ),
  projectRepository
)

export const logInHandler = new CredentialsTransferringLogInHandler(
  new CredentialsTransferrer({
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
)

export const logOutHandler = new ErrorIgnoringLogOutHandler(
  new CompositeLogOutHandler([
    new UserDataCleanUpLogOutHandler(session, projectUserDataRepository),
    new UserDataCleanUpLogOutHandler(session, oAuthTokenRepository)
  ])
)
