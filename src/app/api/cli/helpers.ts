import { env, listFromCommaSeparatedString } from "@/common"
import IGitHubGraphQLClient from "@/features/projects/domain/IGitHubGraphQLClient"
import IGitHubClient from "@/common/github/IGitHubClient"
import IProjectListDataSource from "@/features/projects/domain/IProjectListDataSource"
import IProjectDetailsDataSource from "@/features/projects/domain/IProjectDetailsDataSource"
import {
  GitHubProjectListDataSource,
  GitHubProjectDetailsDataSource,
  GitHubLoginDataSource,
} from "@/features/projects/data"
import RsaEncryptionService from "@/features/encrypt/EncryptionService"
import RemoteConfigEncoder from "@/features/projects/domain/RemoteConfigEncoder"
import GitHubOAuthTokenRefresher from "@/features/auth/data/GitHubOAuthTokenRefresher"
import {
  CLISession,
  ICLISessionStore,
  TokenRefreshingCLIGitHubClient,
  TokenRefreshingCLIGraphQLClient,
} from "@/features/cli/domain"

const tokenRefresher = new GitHubOAuthTokenRefresher({
  clientId: env.getOrThrow("GITHUB_CLIENT_ID"),
  clientSecret: env.getOrThrow("GITHUB_CLIENT_SECRET"),
})

export interface CLIGitHubClientConfig {
  session: CLISession
  sessionStore: ICLISessionStore
}

export function createGitHubClientForCLI(
  config: CLIGitHubClientConfig
): IGitHubGraphQLClient {
  return new TokenRefreshingCLIGraphQLClient({
    session: config.session,
    sessionStore: config.sessionStore,
    tokenRefresher,
  })
}

export function createFullGitHubClientForCLI(
  config: CLIGitHubClientConfig
): IGitHubClient {
  return new TokenRefreshingCLIGitHubClient({
    session: config.session,
    sessionStore: config.sessionStore,
    tokenRefresher,
  })
}

export function createProjectListDataSourceForCLI(
  gitHubClient: IGitHubGraphQLClient
): IProjectListDataSource {
  const repositoryNameSuffix = env.getOrThrow("REPOSITORY_NAME_SUFFIX")
  const projectConfigurationFilename = env.getOrThrow(
    "FRAMNA_DOCS_PROJECT_CONFIGURATION_FILENAME"
  )
  const hiddenRepositories = listFromCommaSeparatedString(env.get("HIDDEN_REPOSITORIES"))

  return new GitHubProjectListDataSource({
    loginsDataSource: new GitHubLoginDataSource({
      graphQlClient: gitHubClient,
    }),
    graphQlClient: gitHubClient,
    repositoryNameSuffix,
    projectConfigurationFilename,
    hiddenRepositories,
  })
}

export function createProjectDetailsDataSourceForCLI(
  gitHubClient: IGitHubGraphQLClient
): IProjectDetailsDataSource {
  const repositoryNameSuffix = env.getOrThrow("REPOSITORY_NAME_SUFFIX")
  const projectConfigurationFilename = env.getOrThrow(
    "FRAMNA_DOCS_PROJECT_CONFIGURATION_FILENAME"
  )

  const encryptionService = new RsaEncryptionService({
    publicKey: Buffer.from(
      env.getOrThrow("ENCRYPTION_PUBLIC_KEY_BASE_64"),
      "base64"
    ).toString("utf-8"),
    privateKey: Buffer.from(
      env.getOrThrow("ENCRYPTION_PRIVATE_KEY_BASE_64"),
      "base64"
    ).toString("utf-8"),
  })
  const remoteConfigEncoder = new RemoteConfigEncoder(encryptionService)

  return new GitHubProjectDetailsDataSource({
    graphQlClient: gitHubClient,
    repositoryNameSuffix,
    projectConfigurationFilename,
    encryptionService,
    remoteConfigEncoder,
  })
}
