import { Pool } from "pg"
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import PostgresAdapter from "@auth/pg-adapter"
import RedisKeyedMutexFactory from "@/common/mutex/RedisKeyedMutexFactory"
import RedisKeyValueStore from "@/common/key-value-store/RedisKeyValueStore"
import {
  AuthjsSession,
  GitHubClient,
  ISession,
  KeyValueUserDataRepository,
  OAuthTokenRefreshingGitHubClient,
  PostgreSQLDB,
  SessionMutexFactory,
  listFromCommaSeparatedString
} from "@/common"
import {
  GitHubLoginDataSource,
  GitHubProjectDataSource
} from "@/features/projects/data"
import {
  CachingProjectDataSource,
  ProjectRepository
} from "@/features/projects/domain"
import {
  GitHubOAuthTokenRefresher
} from "@/features/auth/data"
import {
  AuthjsAccountsOAuthTokenRepository,
  CompositeLogOutHandler,
  ErrorIgnoringLogOutHandler,
  FallbackOAuthTokenRepository,
  LockingOAuthTokenRefresher,
  LogInHandler,
  OAuthTokenDataSource,
  OAuthTokenRepository,
  OAuthTokenSessionValidator,
  PersistingOAuthTokenRefresher,
  UserDataCleanUpLogOutHandler
} from "@/features/auth/domain"
import {
  GitHubHookHandler
} from "@/features/hooks/data"
import {
  PostCommentPullRequestEventHandler,
  FilteringPullRequestEventHandler,
  RepositoryNameEventFilter,
  PullRequestCommenter
} from "@/features/hooks/domain"

const {
  SHAPE_DOCS_BASE_URL,
  SHAPE_DOCS_PROJECT_CONFIGURATION_FILENAME,
  NEXT_PUBLIC_SHAPE_DOCS_TITLE,
  REPOSITORY_NAME_SUFFIX,
  GITHUB_APP_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_PRIVATE_KEY_BASE_64,
  REDIS_URL,
  POSTGRESQL_HOST,
  POSTGRESQL_USER,
  POSTGRESQL_PASSWORD,
  POSTGRESQL_DB,
  GITHUB_WEBHOOK_SECRET,
  GITHUB_WEBHOK_REPOSITORY_ALLOWLIST,
  GITHUB_WEBHOK_REPOSITORY_DISALLOWLIST
} = process.env

const projectConfigurationFilename = SHAPE_DOCS_PROJECT_CONFIGURATION_FILENAME || ".shape-docs.yml"

const gitHubAppCredentials = {
  appId: GITHUB_APP_ID,
  clientId: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  privateKey: Buffer
    .from(GITHUB_PRIVATE_KEY_BASE_64, "base64")
    .toString("utf-8")
}

const pool = new Pool({
  host: POSTGRESQL_HOST,
  user: POSTGRESQL_USER,
  password: POSTGRESQL_PASSWORD,
  database: POSTGRESQL_DB,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

const db = new PostgreSQLDB({ pool })

const oauthTokenRepository = new FallbackOAuthTokenRepository({
  primaryRepository: new OAuthTokenRepository({ db, provider: "github" }),
  secondaryRepository: new AuthjsAccountsOAuthTokenRepository({ db, provider: "github" })
})

const logInHandler = new LogInHandler({ oauthTokenRepository })

export const auth = NextAuth({
  adapter: PostgresAdapter(pool),
  secret: process.env.NEXTAUTH_SECRET,
  theme: {
    logo: "/images/logo.png",
    colorScheme: "light",
    brandColor: "black"
  },
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
      return await logInHandler.handleLogIn({ user, account })
    },
    async session({ session, user }) {
      session.user.id = user.id
      return session
    }
  }
})

export const session: ISession = new AuthjsSession({ auth })

const oauthTokenDataSource = new OAuthTokenDataSource({
  session,
  repository: oauthTokenRepository
})

const oauthTokenRefresher = new LockingOAuthTokenRefresher({
  mutexFactory: new SessionMutexFactory({
    baseKey: "mutexLockingOAuthTokenRefresher",
    mutexFactory: new RedisKeyedMutexFactory(REDIS_URL),
    userIdReader: session
  }),
  oauthTokenRefresher: new PersistingOAuthTokenRefresher({
    userIdReader: session,
    oauthTokenRepository,
    oauthTokenRefresher: new GitHubOAuthTokenRefresher(gitHubAppCredentials)
  })
})

export const gitHubClient = new GitHubClient({
  ...gitHubAppCredentials,
  oauthTokenDataSource
})

export const userGitHubClient = new OAuthTokenRefreshingGitHubClient({
  gitHubClient,
  oauthTokenDataSource,
  oauthTokenRefresher
})

export const blockingSessionValidator = new OAuthTokenSessionValidator({
  oauthTokenDataSource
})

const projectUserDataRepository = new KeyValueUserDataRepository({
  store: new RedisKeyValueStore(REDIS_URL),
  baseKey: "projects"
})

export const projectRepository = new ProjectRepository({
  userIDReader: session,
  repository: projectUserDataRepository
})

export const projectDataSource = new CachingProjectDataSource({
  dataSource: new GitHubProjectDataSource({
    loginsDataSource: new GitHubLoginDataSource({
      graphQlClient: userGitHubClient
    }),
    graphQlClient: userGitHubClient,
    repositoryNameSuffix: REPOSITORY_NAME_SUFFIX,
    projectConfigurationFilename
  }),
  repository: projectRepository
})

export const logOutHandler = new ErrorIgnoringLogOutHandler(
  new CompositeLogOutHandler([
    new UserDataCleanUpLogOutHandler(session, projectUserDataRepository)
  ])
)

export const gitHubHookHandler = new GitHubHookHandler({
  secret: GITHUB_WEBHOOK_SECRET,
  pullRequestEventHandler: new FilteringPullRequestEventHandler({
    filter: new RepositoryNameEventFilter({
      repositoryNameSuffix: REPOSITORY_NAME_SUFFIX,
      allowlist: listFromCommaSeparatedString(GITHUB_WEBHOK_REPOSITORY_ALLOWLIST),
      disallowlist: listFromCommaSeparatedString(GITHUB_WEBHOK_REPOSITORY_DISALLOWLIST)
    }),
    eventHandler: new PostCommentPullRequestEventHandler({
      pullRequestCommenter: new PullRequestCommenter({
        siteName: NEXT_PUBLIC_SHAPE_DOCS_TITLE,
        domain: SHAPE_DOCS_BASE_URL,
        repositoryNameSuffix: REPOSITORY_NAME_SUFFIX,
        projectConfigurationFilename,
        gitHubAppId: GITHUB_APP_ID,
        gitHubClient: gitHubClient
      })
    })
  })
})