import AccessTokenRefreshingGitHubClient from "@/common/github/AccessTokenRefreshingGitHubClient"
import AlwaysValidSessionValidator from "@/common/session/AlwaysValidSessionValidator"
import Auth0RefreshTokenReader from "@/features/auth/data/Auth0RefreshTokenReader"
import Auth0RepositoryAccessReader from "./features/auth/data/Auth0RepositoryAccessReader"
import Auth0Session from "@/common/session/Auth0Session"
import Auth0UserIdentityProviderReader from "./features/auth/data/Auth0UserIdentityProviderReader"
import CachingProjectDataSource from "@/features/projects/domain/CachingProjectDataSource"
import CachingRepositoryAccessReaderConfig from "./features/auth/domain/repositoryAccess/CachingRepositoryAccessReaderConfig"
import CachingUserIdentityProviderReader from "./features/auth/domain/userIdentityProvider/CachingUserIdentityProviderReader"
import CompositeLogOutHandler from "@/features/auth/domain/logOut/CompositeLogOutHandler"
import CredentialsTransferringLogInHandler from "@/features/auth/domain/logIn/CredentialsTransferringLogInHandler"
import ErrorIgnoringLogOutHandler from "@/features/auth/domain/logOut/ErrorIgnoringLogOutHandler"
import GitHubClient from "@/common/github/GitHubClient"
import GitHubOAuthTokenRefresher from "@/features/auth/data/GitHubOAuthTokenRefresher"
import GitHubOrganizationSessionValidator from "@/common/session/GitHubOrganizationSessionValidator"
import GitHubProjectDataSource from "@/features/projects/data/GitHubProjectDataSource"
import GitHubInstallationAccessTokenDataSource from "@/features/auth/data/GitHubInstallationAccessTokenDataSource"
import GuestAccessTokenService from "@/features/auth/domain/accessToken/GuestAccessTokenService"
import GuestCredentialsTransferrer from "@/features/auth/domain/credentialsTransfer/GuestCredentialsTransferrer"
import HostAccessTokenService from "@/features/auth/domain/accessToken/HostAccessTokenService"
import HostCredentialsTransferrer from "@/features/auth/domain/credentialsTransfer/HostCredentialsTransferrer"
import IsUserGuestReader from "@/features/auth/domain/userIdentityProvider/IsUserGuestReader"
import KeyValueUserDataRepository from "@/common/userData/KeyValueUserDataRepository"
import LockingAccessTokenService from "@/features/auth/domain/accessToken/LockingAccessTokenService"
import OAuthTokenRepository from "@/features/auth/domain/oAuthToken/OAuthTokenRepository"
import OnlyStaleRefreshingAccessTokenService from "@/features/auth/domain/accessToken/OnlyStaleRefreshingAccessTokenService"
import ProjectRepository from "@/features/projects/domain/ProjectRepository"
import RedisKeyedMutexFactory from "@/common/mutex/RedisKeyedMutexFactory"
import RedisKeyValueStore from "@/common/keyValueStore/RedisKeyValueStore"
import RepositoryRestrictingAccessTokenDataSource from "@/features/auth/domain/repositoryAccess/RepositoryRestrictingAccessTokenDataSource"
import SessionAccessTokenService from "@/features/auth/domain/accessToken/SessionAccessTokenService"
import SessionMutexFactory from "@/common/mutex/SessionMutexFactory"
import SessionValidatingProjectDataSource from "@/features/projects/domain/SessionValidatingProjectDataSource"
import SessionValidator from "@/common/session/SessionValidator"
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

const accessTokenRepository = new KeyValueUserDataRepository(
  new RedisKeyValueStore(REDIS_URL),
  "accessToken"
)

const guestRepositoryAccessRepository = new KeyValueUserDataRepository(
  new RedisKeyValueStore(REDIS_URL),
  "guestRepositoryAccess"
)

const guestAccessTokenDataSource = new RepositoryRestrictingAccessTokenDataSource({
  repositoryAccessReader: new CachingRepositoryAccessReaderConfig({
    repository: guestRepositoryAccessRepository,
    repositoryAccessReader: new Auth0RepositoryAccessReader({
      ...auth0ManagementCredentials
    })
  }),
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
    new SessionAccessTokenService({
      isGuestReader: session,
      guestAccessTokenService: new GuestAccessTokenService({
        userIdReader: session,
        repository: accessTokenRepository,
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

const userGitHubClient = new AccessTokenRefreshingGitHubClient(
  accessTokenService,
  gitHubClient
)

export const sessionValidator = new SessionValidator({
  isGuestReader: session,
  guestSessionValidator: new AlwaysValidSessionValidator(),
  hostSessionValidator: new GitHubOrganizationSessionValidator(
    userGitHubClient,
    GITHUB_ORGANIZATION_NAME
  )
})

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

export const logInHandler = new CredentialsTransferringLogInHandler({
  isUserGuestReader: new IsUserGuestReader(
    userIdentityProviderReader
  ),
  guestCredentialsTransferrer: new GuestCredentialsTransferrer({
    repository: accessTokenRepository,
    dataSource: guestAccessTokenDataSource
  }),
  hostCredentialsTransferrer: new HostCredentialsTransferrer({
    refreshTokenReader: new Auth0RefreshTokenReader({
      ...auth0ManagementCredentials,
      connection: "github"
    }),
    oAuthTokenRefresher: gitHubOAuthTokenRefresher,
    oAuthTokenRepository: oAuthTokenRepository
  })
})

export const logOutHandler = new ErrorIgnoringLogOutHandler(
  new CompositeLogOutHandler([
    new UserDataCleanUpLogOutHandler(session, projectUserDataRepository),
    new UserDataCleanUpLogOutHandler(session, oAuthTokenRepository),
    new UserDataCleanUpLogOutHandler(session, userIdentityProviderRepository),
    new UserDataCleanUpLogOutHandler(session, guestRepositoryAccessRepository) 
  ])
)
