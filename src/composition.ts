import { AuthjsSession } from "@/common/session"
import RedisKeyedMutexFactory from "@/common/mutex/RedisKeyedMutexFactory"
import RedisKeyValueStore from "@/common/keyValueStore/RedisKeyValueStore"
import {
  AccessTokenRefreshingGitHubClient,
  GitHubClient,
  KeyValueUserDataRepository,
  SessionMutexFactory
} from "@/common"
import {
  GitHubProjectDataSource,
  GitHubProjectRepositoryDataSource
} from "@/features/projects/data"
import {
  CachingProjectDataSource,
  ProjectRepository
} from "@/features/projects/domain"
import {
  GitHubOAuthTokenRefresher,
  GitHubInstallationAccessTokenDataSource,
  AuthjsRefreshTokenReader,
  AuthjsRepositoryAccessReader
} from "@/features/auth/data"
import {
  AccessTokenService,
  AccessTokenSessionValidator,
  CachingRepositoryAccessReader,
  CompositeLogInHandler,
  CompositeLogOutHandler,
  CredentialsTransferringLogInHandler,
  ErrorIgnoringLogOutHandler,
  GitHubOrganizationSessionValidator,
  GuestAccessTokenRepository,
  GuestAccessTokenService,
  GuestCredentialsTransferrer,
  HostAccessTokenService,
  HostCredentialsTransferrer,
  HostOnlySessionValidator,
  IsUserGuestReader,
  LockingAccessTokenService,
  OAuthTokenRepository,
  OnlyStaleRefreshingAccessTokenService,
  RepositoryRestrictingAccessTokenDataSource,
  UserDataCleanUpLogOutHandler
} from "@/features/auth/domain"

const {
  GITHUB_APP_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_PRIVATE_KEY_BASE_64,
  GITHUB_ORGANIZATION_NAME,
  REDIS_URL
} = process.env

const gitHubAppCredentials = {
  appId: GITHUB_APP_ID,
  clientId: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  privateKey: Buffer
    .from(GITHUB_PRIVATE_KEY_BASE_64, "base64")
    .toString("utf-8")
}

const userIdentityProviderRepository = new KeyValueUserDataRepository(
  new RedisKeyValueStore(REDIS_URL),
  "userIdentityProvider"
)

export const session = new AuthjsSession({
  isUserGuestReader: new IsUserGuestReader()
})

const oAuthTokenRepository = new OAuthTokenRepository(
  new KeyValueUserDataRepository(
    new RedisKeyValueStore(REDIS_URL),
    "authToken"
  )
)

const gitHubOAuthTokenRefresher = new GitHubOAuthTokenRefresher({
  clientId: gitHubAppCredentials.clientId,
  clientSecret: gitHubAppCredentials.clientSecret
})

const guestAccessTokenRepository = new GuestAccessTokenRepository(
  new KeyValueUserDataRepository(
    new RedisKeyValueStore(REDIS_URL),
    "accessToken"
  )
)

const guestRepositoryAccessRepository = new KeyValueUserDataRepository(
  new RedisKeyValueStore(REDIS_URL),
  "guestRepositoryAccess"
)

export const guestRepositoryAccessReader = new CachingRepositoryAccessReader({
  repository: guestRepositoryAccessRepository,
  repositoryAccessReader: new AuthjsRepositoryAccessReader()
})

const guestAccessTokenDataSource = new RepositoryRestrictingAccessTokenDataSource({
  repositoryAccessReader: guestRepositoryAccessReader,
  dataSource: new GitHubInstallationAccessTokenDataSource({
    ...gitHubAppCredentials,
    organization: GITHUB_ORGANIZATION_NAME
  })
})

export const accessTokenService = new LockingAccessTokenService(
  new SessionMutexFactory(
    new RedisKeyedMutexFactory(REDIS_URL),
    session,
    "mutexAccessToken"
  ),
  new OnlyStaleRefreshingAccessTokenService(
    new AccessTokenService({
      isGuestReader: session,
      guestAccessTokenService: new GuestAccessTokenService({
        userIdReader: session,
        repository: guestAccessTokenRepository,
        dataSource: guestAccessTokenDataSource
      }),
      hostAccessTokenService: new HostAccessTokenService({
        userIdReader: session,
        repository: oAuthTokenRepository,
        refresher: gitHubOAuthTokenRefresher
      })
    })
  )
)

export const gitHubClient = new GitHubClient({
  ...gitHubAppCredentials,
  accessTokenReader: accessTokenService
})

export const userGitHubClient = new AccessTokenRefreshingGitHubClient(
  accessTokenService,
  gitHubClient
)

export const blockingSessionValidator = new AccessTokenSessionValidator({
  accessTokenService: accessTokenService
})
export const delayedSessionValidator = new HostOnlySessionValidator({
  isGuestReader: session,
  sessionValidator: new GitHubOrganizationSessionValidator({
    acceptedOrganization: GITHUB_ORGANIZATION_NAME,
    organizationMembershipStatusReader: userGitHubClient
  })
})

const projectUserDataRepository = new KeyValueUserDataRepository(
  new RedisKeyValueStore(REDIS_URL),
  "projects"
)

export const projectRepository = new ProjectRepository(
  session,
  projectUserDataRepository
)

export const projectDataSource = new CachingProjectDataSource({
  dataSource: new GitHubProjectDataSource({
    dataSource: new GitHubProjectRepositoryDataSource({
      graphQlClient: userGitHubClient,
      organizationName: GITHUB_ORGANIZATION_NAME
    })
  }),
  repository: projectRepository
})

export const logInHandler = new CompositeLogInHandler([
  new CredentialsTransferringLogInHandler({
    isUserGuestReader: new IsUserGuestReader(),
    guestCredentialsTransferrer: new GuestCredentialsTransferrer({
      dataSource: guestAccessTokenDataSource,
      repository: guestAccessTokenRepository
    }),
    hostCredentialsTransferrer: new HostCredentialsTransferrer({
      refreshTokenReader: new AuthjsRefreshTokenReader(),
      oAuthTokenRefresher: gitHubOAuthTokenRefresher,
      oAuthTokenRepository: oAuthTokenRepository
    })
  })
])

export const logOutHandler = new ErrorIgnoringLogOutHandler(
  new CompositeLogOutHandler([
    new UserDataCleanUpLogOutHandler(session, projectUserDataRepository),
    new UserDataCleanUpLogOutHandler(session, userIdentityProviderRepository),
    new UserDataCleanUpLogOutHandler(session, guestRepositoryAccessRepository),
    new UserDataCleanUpLogOutHandler(session, oAuthTokenRepository),
    new UserDataCleanUpLogOutHandler(session, guestAccessTokenRepository)
  ])
)
