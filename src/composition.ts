import { Pool } from "pg"
import { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import PostgresAdapter from "@auth/pg-adapter"
import { Adapter } from "next-auth/adapters"
import { AuthjsSession } from "@/common/session"
import RedisKeyedMutexFactory from "@/common/mutex/RedisKeyedMutexFactory"
import RedisKeyValueStore from "@/common/keyValueStore/RedisKeyValueStore"
import {
  AccessTokenRefreshingGitHubClient,
  GitHubClient,
  KeyValueUserDataRepository,
  PostgreSQLDB,
  SessionMutexFactory
} from "@/common"
import {
  GitHubProjectDataSource
} from "@/features/projects/data"
import {
  CachingProjectDataSource,
  ProjectRepository
} from "@/features/projects/domain"
import {
  GitHubOAuthTokenRefresher,
  AuthjsOAuthTokenRepository,
  AuthjsRepositoryAccessReader
} from "@/features/auth/data"
import {
  AccessTokenRefresher,
  AccessTokenSessionValidator,
  CachingRepositoryAccessReader,
  CompositeLogOutHandler,
  ErrorIgnoringLogOutHandler,
  GitHubOrganizationSessionValidator,
  OAuthAccountCredentialPersistingLogInHandler,
  HostOnlySessionValidator,
  LockingAccessTokenRefresher,
  OAuthTokenRepository,
  TransferringAccessTokenReader,
  UserDataCleanUpLogOutHandler
} from "@/features/auth/domain"

const {
  GITHUB_APP_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_PRIVATE_KEY_BASE_64,
  GITHUB_ORGANIZATION_NAME,
  REDIS_URL,
  POSTGRESQL_HOST,
  POSTGRESQL_USER,
  POSTGRESQL_DB
} = process.env

const pool = new Pool({
  host: POSTGRESQL_HOST,
  user: POSTGRESQL_USER,
  database: POSTGRESQL_DB,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

const db = new PostgreSQLDB({ pool })

const logInHandler = new OAuthAccountCredentialPersistingLogInHandler({
  db,
  provider: "github"
})

export const authOptions: NextAuthOptions = {
  adapter: PostgresAdapter(pool) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "repo"
        }
      }
    })
  ],
  session: {
    strategy: "database"
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account) {
        return await logInHandler.handleLogIn(user.id, account)
      } else {
        return await logInHandler.handleLogIn(user.id)
      }
    },
    async session({ session, user }) {
      session.user.id = user.id
      return session
    }
  }
}

const gitHubAppCredentials = {
  appId: GITHUB_APP_ID,
  clientId: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  privateKey: Buffer
    .from(GITHUB_PRIVATE_KEY_BASE_64, "base64")
    .toString("utf-8")
}

export const session = new AuthjsSession({ authOptions })

const accessTokenReader = new TransferringAccessTokenReader({
  userIdReader: session,
  sourceOAuthTokenRepository: new AuthjsOAuthTokenRepository({ provider: "github", db }),
  destinationOAuthTokenRepository: new OAuthTokenRepository({ provider: "github", db })
})

const guestRepositoryAccessRepository = new KeyValueUserDataRepository(
  new RedisKeyValueStore(REDIS_URL),
  "guestRepositoryAccess"
)

export const guestRepositoryAccessReader = new CachingRepositoryAccessReader({
  repository: guestRepositoryAccessRepository,
  repositoryAccessReader: new AuthjsRepositoryAccessReader()
})

export const gitHubClient = new GitHubClient({
  ...gitHubAppCredentials,
  accessTokenReader
})

export const userGitHubClient = new AccessTokenRefreshingGitHubClient({
  gitHubClient,
  accessTokenReader,
  accessTokenRefresher: new LockingAccessTokenRefresher({
    mutexFactory: new SessionMutexFactory(
      new RedisKeyedMutexFactory(REDIS_URL),
      session,
      "mutexAccessToken"
    ),
    accessTokenRefresher: new AccessTokenRefresher({
      userIdReader: session,
      oAuthTokenRepository: new OAuthTokenRepository({ db, provider: "github" }),
      oAuthTokenRefresher: new GitHubOAuthTokenRefresher({
        clientId: gitHubAppCredentials.clientId,
        clientSecret: gitHubAppCredentials.clientSecret
      })
    })
  })
})

export const blockingSessionValidator = new AccessTokenSessionValidator({
  accessTokenReader
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
    graphQlClient: userGitHubClient,
    organizationName: GITHUB_ORGANIZATION_NAME
  }),
  repository: projectRepository
})

export const logOutHandler = new ErrorIgnoringLogOutHandler(
  new CompositeLogOutHandler([
    new UserDataCleanUpLogOutHandler(session, projectUserDataRepository),
    new UserDataCleanUpLogOutHandler(session, guestRepositoryAccessRepository)
  ])
)
