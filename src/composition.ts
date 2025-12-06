import { Pool } from "pg"
import NextAuth from "next-auth"
import type { Provider } from "next-auth/providers"
import GithubProvider from "next-auth/providers/github"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"
import PostgresAdapter from "@auth/pg-adapter"
import RedisKeyedMutexFactory from "@/common/mutex/RedisKeyedMutexFactory"
import RedisKeyValueStore from "@/common/key-value-store/RedisKeyValueStore"
import {
  AuthjsSession,
  env,
  GitHubClient,
  ISession,
  KeyValueUserDataRepository,
  OAuthTokenRefreshingGitHubClient,
  PostgreSQLDB,
  SessionMutexFactory,
  listFromCommaSeparatedString
} from "@/common"
import { AzureDevOpsClient, OAuthTokenRefreshingAzureDevOpsClient } from "@/common/azure-devops"
import { GitHubBlobProvider, AzureDevOpsBlobProvider, IBlobProvider } from "@/common/blob"
import {
  GitHubLoginDataSource,
  GitHubProjectDataSource,
  GitHubRepositoryDataSource,
  AzureDevOpsRepositoryDataSource,
  AzureDevOpsProjectDataSource
} from "@/features/projects/data"
import {
  CachingProjectDataSource,
  FilteringGitHubRepositoryDataSource,
  ProjectRepository,
  IProjectDataSource
} from "@/features/projects/domain"
import {
  GitHubOAuthTokenRefresher,
  AzureDevOpsOAuthTokenRefresher
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
  UserDataCleanUpLogOutHandler,
  IOAuthTokenRefresher
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
import { RepoRestrictedGitHubClient } from "./common/github/RepoRestrictedGitHubClient"
import RsaEncryptionService from "./features/encrypt/EncryptionService"
import RemoteConfigEncoder from "./features/projects/domain/RemoteConfigEncoder"
import { OasDiffCalculator } from "./features/diff/data/OasDiffCalculator"
import { IOasDiffCalculator } from "./features/diff/data/IOasDiffCalculator"

// Provider configuration
const projectSourceProvider = env.get("PROJECT_SOURCE_PROVIDER") || "github"
const isGitHubProvider = projectSourceProvider === "github"
const isAzureDevOpsProvider = projectSourceProvider === "azure-devops"

// Microsoft's registered Application ID for Azure DevOps
const AZURE_DEVOPS_RESOURCE_ID = "499b84ac-1321-427f-aa17-267ca6975798"

// GitHub credentials (only loaded if using GitHub provider)
const gitHubAppCredentials = isGitHubProvider ? {
  appId: env.getOrThrow("GITHUB_APP_ID"),
  clientId: env.getOrThrow("GITHUB_CLIENT_ID"),
  clientSecret: env.getOrThrow("GITHUB_CLIENT_SECRET"),
  privateKey: Buffer
    .from(env.getOrThrow("GITHUB_PRIVATE_KEY_BASE_64"), "base64")
    .toString("utf-8")
} : null

// Azure DevOps credentials (only loaded if using Azure DevOps provider)
const azureDevOpsCredentials = isAzureDevOpsProvider ? {
  clientId: env.getOrThrow("AZURE_ENTRA_ID_CLIENT_ID"),
  clientSecret: env.getOrThrow("AZURE_ENTRA_ID_CLIENT_SECRET"),
  tenantId: env.getOrThrow("AZURE_ENTRA_ID_TENANT_ID"),
  organization: env.getOrThrow("AZURE_DEVOPS_ORGANIZATION")
} : null

const pool = new Pool({
  host: env.getOrThrow("POSTGRESQL_HOST"),
  user: env.getOrThrow("POSTGRESQL_USER"),
  password: env.get("POSTGRESQL_PASSWORD"),
  database: env.getOrThrow("POSTGRESQL_DB"),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

const db = new PostgreSQLDB({ pool })

// The NextAuth provider ID differs from our config value
const authProviderName = isAzureDevOpsProvider ? "microsoft-entra-id" : "github"

const oauthTokenRepository = new FallbackOAuthTokenRepository({
  primaryRepository: new OAuthTokenRepository({ db, provider: authProviderName }),
  secondaryRepository: new AuthjsAccountsOAuthTokenRepository({ db, provider: authProviderName })
})

const logInHandler = new LogInHandler({ oauthTokenRepository })

// Build auth providers based on configuration
function getAuthProviders(): Provider[] {
  if (isGitHubProvider && gitHubAppCredentials) {
    return [
      GithubProvider({
        clientId: gitHubAppCredentials.clientId,
        clientSecret: gitHubAppCredentials.clientSecret,
        authorization: {
          params: {
            scope: "repo"
          }
        }
      })
    ]
  } else if (isAzureDevOpsProvider && azureDevOpsCredentials) {
    return [
      MicrosoftEntraID({
        clientId: azureDevOpsCredentials.clientId,
        clientSecret: azureDevOpsCredentials.clientSecret,
        issuer: `https://login.microsoftonline.com/${azureDevOpsCredentials.tenantId}/v2.0`,
        authorization: {
          params: {
            // Request Azure DevOps API access + offline_access for refresh tokens
            scope: `openid profile email offline_access ${AZURE_DEVOPS_RESOURCE_ID}/.default`
          }
        }
      })
    ]
  }
  throw new Error(`Unsupported PROJECT_SOURCE_PROVIDER: ${projectSourceProvider}`)
}

export const { signIn, auth, handlers: authHandlers } = NextAuth({
  adapter: PostgresAdapter(pool),
  secret: env.getOrThrow("NEXTAUTH_SECRET"),
  theme: {
    logo: "/images/logo.png",
    colorScheme: "light",
    brandColor: "black"
  },
  pages: {
    signIn: "/auth/signin"
  },
  providers: getAuthProviders(),
  session: {
    strategy: "database"
  },
  callbacks: {
    async signIn({ user, account }) {
      return await logInHandler.handleLogIn({ user, account })
    },
    async session({ session, user }) {
      // Construct a new session object conforming to DefaultSession
      // If "session" is returned it will include everything from AdapterSession,
      // which is critical as this contains the sessionToken
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        },
        expires: session.expires,
      }
    }
  }
})

export const session: ISession = new AuthjsSession({ auth })

const oauthTokenDataSource = new OAuthTokenDataSource({
  session,
  repository: oauthTokenRepository
})

// Build OAuth token refresher based on provider
function getOAuthTokenRefresher(): IOAuthTokenRefresher {
  if (isGitHubProvider && gitHubAppCredentials) {
    return new GitHubOAuthTokenRefresher(gitHubAppCredentials)
  } else if (isAzureDevOpsProvider && azureDevOpsCredentials) {
    return new AzureDevOpsOAuthTokenRefresher({
      clientId: azureDevOpsCredentials.clientId,
      clientSecret: azureDevOpsCredentials.clientSecret,
      tenantId: azureDevOpsCredentials.tenantId
    })
  }
  throw new Error(`Unsupported PROJECT_SOURCE_PROVIDER: ${projectSourceProvider}`)
}

const oauthTokenRefresher = new LockingOAuthTokenRefresher({
  mutexFactory: new SessionMutexFactory({
    baseKey: "mutexLockingOAuthTokenRefresher",
    mutexFactory: new RedisKeyedMutexFactory(env.getOrThrow("REDIS_URL")),
    userIdReader: session
  }),
  oauthTokenRefresher: new PersistingOAuthTokenRefresher({
    userIdReader: session,
    oauthTokenRepository,
    oauthTokenRefresher: getOAuthTokenRefresher()
  })
})

// GitHub-specific clients (only used for GitHub provider)
const gitHubClient = isGitHubProvider && gitHubAppCredentials ? new GitHubClient({
  ...gitHubAppCredentials,
  oauthTokenDataSource
}) : null

const repoRestrictedGitHubClient = gitHubClient ? new RepoRestrictedGitHubClient({
  repositoryNameSuffix: env.getOrThrow("REPOSITORY_NAME_SUFFIX"),
  gitHubClient
}) : null

export const userGitHubClient = repoRestrictedGitHubClient ? new OAuthTokenRefreshingGitHubClient({
  gitHubClient: repoRestrictedGitHubClient,
  oauthTokenDataSource,
  oauthTokenRefresher
}) : null

// Azure DevOps client (only used for Azure DevOps provider)
const baseAzureDevOpsClient = isAzureDevOpsProvider && azureDevOpsCredentials ? new AzureDevOpsClient({
  organization: azureDevOpsCredentials.organization,
  oauthTokenDataSource
}) : null

export const azureDevOpsClient = baseAzureDevOpsClient ? new OAuthTokenRefreshingAzureDevOpsClient({
  client: baseAzureDevOpsClient,
  oauthTokenDataSource,
  oauthTokenRefresher
}) : null

// Blob provider for fetching file content
function getBlobProvider(): IBlobProvider {
  if (userGitHubClient) {
    return new GitHubBlobProvider({ gitHubClient: userGitHubClient })
  } else if (azureDevOpsClient) {
    return new AzureDevOpsBlobProvider({ client: azureDevOpsClient })
  }
  throw new Error(`No blob provider available for PROJECT_SOURCE_PROVIDER: ${projectSourceProvider}`)
}

export const blobProvider = getBlobProvider()

export const blockingSessionValidator = new OAuthTokenSessionValidator({
  oauthTokenDataSource
})

const projectUserDataRepository = new KeyValueUserDataRepository({
  store: new RedisKeyValueStore(env.getOrThrow("REDIS_URL")),
  baseKey: "projects"
})

export const projectRepository = new ProjectRepository({
  userIDReader: session,
  repository: projectUserDataRepository
})

export const encryptionService = new RsaEncryptionService({
  publicKey: Buffer.from(env.getOrThrow("ENCRYPTION_PUBLIC_KEY_BASE_64"), "base64").toString("utf-8"),
  privateKey: Buffer.from(env.getOrThrow("ENCRYPTION_PRIVATE_KEY_BASE_64"), "base64").toString("utf-8")
})

export const remoteConfigEncoder = new RemoteConfigEncoder(encryptionService)

// Build project data source based on provider
function getProjectDataSource(): IProjectDataSource {
  if (isGitHubProvider && userGitHubClient) {
    return new GitHubProjectDataSource({
      repositoryDataSource: new FilteringGitHubRepositoryDataSource({
        hiddenRepositories: listFromCommaSeparatedString(env.get("HIDDEN_REPOSITORIES")),
        dataSource: new GitHubRepositoryDataSource({
          loginsDataSource: new GitHubLoginDataSource({
            graphQlClient: userGitHubClient
          }),
          graphQlClient: userGitHubClient,
          repositoryNameSuffix: env.getOrThrow("REPOSITORY_NAME_SUFFIX"),
          projectConfigurationFilename: env.getOrThrow("FRAMNA_DOCS_PROJECT_CONFIGURATION_FILENAME")
        })
      }),
      repositoryNameSuffix: env.getOrThrow("REPOSITORY_NAME_SUFFIX"),
      encryptionService: encryptionService,
      remoteConfigEncoder: remoteConfigEncoder
    })
  } else if (isAzureDevOpsProvider && azureDevOpsClient && azureDevOpsCredentials) {
    return new AzureDevOpsProjectDataSource({
      repositoryDataSource: new AzureDevOpsRepositoryDataSource({
        client: azureDevOpsClient,
        organization: azureDevOpsCredentials.organization,
        repositoryNameSuffix: env.getOrThrow("REPOSITORY_NAME_SUFFIX"),
        projectConfigurationFilename: env.getOrThrow("FRAMNA_DOCS_PROJECT_CONFIGURATION_FILENAME")
      }),
      repositoryNameSuffix: env.getOrThrow("REPOSITORY_NAME_SUFFIX"),
      encryptionService: encryptionService,
      remoteConfigEncoder: remoteConfigEncoder
    })
  }
  throw new Error(`Unsupported PROJECT_SOURCE_PROVIDER: ${projectSourceProvider}`)
}

export const projectDataSource = new CachingProjectDataSource({
  dataSource: getProjectDataSource(),
  repository: projectRepository
})

export const logOutHandler = new ErrorIgnoringLogOutHandler(
  new CompositeLogOutHandler([
    new UserDataCleanUpLogOutHandler(session, projectUserDataRepository)
  ])
)

// GitHub webhook handler (only available for GitHub provider)
export const gitHubHookHandler = isGitHubProvider && gitHubClient ? new GitHubHookHandler({
  secret: env.getOrThrow("GITHUB_WEBHOOK_SECRET"),
  pullRequestEventHandler: new FilteringPullRequestEventHandler({
    filter: new RepositoryNameEventFilter({
      repositoryNameSuffix: env.getOrThrow("REPOSITORY_NAME_SUFFIX"),
      allowlist: listFromCommaSeparatedString(env.get("GITHUB_WEBHOK_REPOSITORY_ALLOWLIST")),
      disallowlist: listFromCommaSeparatedString(env.get("GITHUB_WEBHOK_REPOSITORY_DISALLOWLIST"))
    }),
    eventHandler: new PostCommentPullRequestEventHandler({
      pullRequestCommenter: new PullRequestCommenter({
        siteName: env.getOrThrow("FRAMNA_DOCS_TITLE"),
        domain: env.getOrThrow("FRAMNA_DOCS_BASE_URL"),
        repositoryNameSuffix: env.getOrThrow("REPOSITORY_NAME_SUFFIX"),
        projectConfigurationFilename: env.getOrThrow("FRAMNA_DOCS_PROJECT_CONFIGURATION_FILENAME"),
        gitHubAppId: env.getOrThrow("GITHUB_APP_ID"),
        gitHubClient: gitHubClient
      })
    })
  })
) : null

// Diff calculator only available for GitHub provider (requires GitHub-specific APIs)
export const diffCalculator: IOasDiffCalculator | null = gitHubClient
  ? new OasDiffCalculator(gitHubClient)
  : null
