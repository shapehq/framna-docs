import { Octokit } from "octokit"
import { env } from "@/common"
import IGitHubGraphQLClient, {
  GitHubGraphQLClientRequest,
  GitHubGraphQLClientResponse,
} from "@/features/projects/domain/IGitHubGraphQLClient"
import IGitHubClient, {
  GraphQLQueryRequest,
  GraphQlQueryResponse,
  GetRepositoryContentRequest,
  RepositoryContent,
  GetPullRequestFilesRequest,
  PullRequestFile,
  GetPullRequestCommentsRequest,
  PullRequestComment,
  AddCommentToPullRequestRequest,
  UpdatePullRequestCommentRequest,
  CompareCommitsRequest,
  CompareCommitsResponse,
} from "@/common/github/IGitHubClient"
import IProjectListDataSource from "@/features/projects/domain/IProjectListDataSource"
import IProjectDetailsDataSource from "@/features/projects/domain/IProjectDetailsDataSource"
import {
  GitHubProjectListDataSource,
  GitHubProjectDetailsDataSource,
  GitHubLoginDataSource,
} from "@/features/projects/data"
import RsaEncryptionService from "@/features/encrypt/EncryptionService"
import RemoteConfigEncoder from "@/features/projects/domain/RemoteConfigEncoder"

type GitHubContentItem = { download_url: string }

/**
 * Simple GitHub GraphQL client that uses a static access token.
 */
class SimpleGitHubClient implements IGitHubGraphQLClient {
  private readonly octokit: Octokit

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken })
  }

  async graphql(
    request: GitHubGraphQLClientRequest
  ): Promise<GitHubGraphQLClientResponse> {
    return await this.octokit.graphql(request.query, request.variables)
  }
}

/**
 * Full GitHub client implementation for CLI.
 */
class CLIGitHubClient implements IGitHubClient {
  private readonly octokit: Octokit

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken })
  }

  async graphql(request: GraphQLQueryRequest): Promise<GraphQlQueryResponse> {
    return await this.octokit.graphql(request.query, request.variables)
  }

  async getRepositoryContent(
    request: GetRepositoryContentRequest
  ): Promise<RepositoryContent> {
    const response = await this.octokit.rest.repos.getContent({
      owner: request.repositoryOwner,
      repo: request.repositoryName,
      path: request.path,
      ref: request.ref,
    })
    const item = response.data as GitHubContentItem
    return { downloadURL: item.download_url }
  }

  async getPullRequestFiles(
    _request: GetPullRequestFilesRequest
  ): Promise<PullRequestFile[]> {
    throw new Error("Not implemented for CLI client")
  }

  async getPullRequestComments(
    _request: GetPullRequestCommentsRequest
  ): Promise<PullRequestComment[]> {
    throw new Error("Not implemented for CLI client")
  }

  async addCommentToPullRequest(
    _request: AddCommentToPullRequestRequest
  ): Promise<void> {
    throw new Error("Not implemented for CLI client")
  }

  async updatePullRequestComment(
    _request: UpdatePullRequestCommentRequest
  ): Promise<void> {
    throw new Error("Not implemented for CLI client")
  }

  async compareCommitsWithBasehead(
    _request: CompareCommitsRequest
  ): Promise<CompareCommitsResponse> {
    throw new Error("Not implemented for CLI client")
  }
}

export function createGitHubClientForCLI(
  accessToken: string
): IGitHubGraphQLClient {
  return new SimpleGitHubClient(accessToken)
}

export function createFullGitHubClientForCLI(
  accessToken: string
): IGitHubClient {
  return new CLIGitHubClient(accessToken)
}

export function createProjectListDataSourceForCLI(
  gitHubClient: IGitHubGraphQLClient
): IProjectListDataSource {
  const repositoryNameSuffix = env.getOrThrow("REPOSITORY_NAME_SUFFIX")
  const projectConfigurationFilename = env.getOrThrow(
    "FRAMNA_DOCS_PROJECT_CONFIGURATION_FILENAME"
  )

  return new GitHubProjectListDataSource({
    loginsDataSource: new GitHubLoginDataSource({
      graphQlClient: gitHubClient,
    }),
    graphQlClient: gitHubClient,
    repositoryNameSuffix,
    projectConfigurationFilename,
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
