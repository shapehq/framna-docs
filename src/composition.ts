import Auth0Session from "@/common/session/Auth0Session"
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
  Auth0MetadataUpdater,
  Auth0RefreshTokenReader,
  Auth0RepositoryAccessReader,
  Auth0UserIdentityProviderReader
} from "@/features/auth/data"
import {
  AccessTokenService,
  AccessTokenSessionValidator,
  CachingRepositoryAccessReader,
  CachingUserIdentityProviderReader,
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
  RemoveInvitedFlagLogInHandler,
  RepositoryRestrictingAccessTokenDataSource,
  UserDataCleanUpLogOutHandler
} from "@/features/auth/domain"

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

const auth0ManagementCredentials = {
  domain: AUTH0_MANAGEMENT_DOMAIN,
  clientId: AUTH0_MANAGEMENT_CLIENT_ID,
  clientSecret: AUTH0_MANAGEMENT_CLIENT_SECRET
}

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

export const userIdentityProviderReader = new CachingUserIdentityProviderReader(
  userIdentityProviderRepository,
  new Auth0UserIdentityProviderReader(auth0ManagementCredentials)
)

export const session = new Auth0Session({
  isUserGuestReader: new IsUserGuestReader(userIdentityProviderReader)
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
  repositoryAccessReader: new Auth0RepositoryAccessReader({
    ...auth0ManagementCredentials
  })
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
    isUserGuestReader: new IsUserGuestReader(
      userIdentityProviderReader
    ),
    guestCredentialsTransferrer: new GuestCredentialsTransferrer({
      dataSource: guestAccessTokenDataSource,
      repository: guestAccessTokenRepository
    }),
    hostCredentialsTransferrer: new HostCredentialsTransferrer({
      refreshTokenReader: new Auth0RefreshTokenReader({
        ...auth0ManagementCredentials,
        connection: "github"
      }),
      oAuthTokenRefresher: gitHubOAuthTokenRefresher,
      oAuthTokenRepository: oAuthTokenRepository
    })
  }),
  new RemoveInvitedFlagLogInHandler(
    new Auth0MetadataUpdater({ ...auth0ManagementCredentials })
  )
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
