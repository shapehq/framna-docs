import { 
    IGitHubClient, 
    AddCommentToPullRequestRequest, 
    GetPullRequestCommentsRequest, 
    GetPullRequestFilesRequest, 
    GetRepositoryContentRequest, 
    GraphQLQueryRequest, 
    GraphQlQueryResponse, 
    PullRequestComment, 
    PullRequestFile, 
    RepositoryContent, 
    UpdatePullRequestCommentRequest
} from "@/common";

export class RepoRestrictedGitHubClient implements IGitHubClient {

    private gitHubClient: IGitHubClient;
    private repositoryNameSuffix: string;

    constructor(config: {
        repositoryNameSuffix: string;
        gitHubClient: IGitHubClient
    }) {
        this.gitHubClient = config.gitHubClient;
        this.repositoryNameSuffix = config.repositoryNameSuffix;
    }

    graphql(request: GraphQLQueryRequest): Promise<GraphQlQueryResponse> {
        return this.gitHubClient.graphql(request);
    }

    getRepositoryContent(request: GetRepositoryContentRequest): Promise<RepositoryContent> {
        if (!this.isRepositoryNameValid(request.repositoryName)) return Promise.reject(new Error("Invalid repository name"));
        return this.gitHubClient.getRepositoryContent(request);
    }

    getPullRequestFiles(request: GetPullRequestFilesRequest): Promise<PullRequestFile[]> {
        if (!this.isRepositoryNameValid(request.repositoryName)) return Promise.reject(new Error("Invalid repository name"));
        return this.gitHubClient.getPullRequestFiles(request);
    }

    getPullRequestComments(request: GetPullRequestCommentsRequest): Promise<PullRequestComment[]> {
        if (!this.isRepositoryNameValid(request.repositoryName)) return Promise.reject(new Error("Invalid repository name"));
        return this.gitHubClient.getPullRequestComments(request);
    }

    addCommentToPullRequest(request: AddCommentToPullRequestRequest): Promise<void> {
        if (!this.isRepositoryNameValid(request.repositoryName)) return Promise.reject(new Error("Invalid repository name"));
        return this.gitHubClient.addCommentToPullRequest(request);
    }

    updatePullRequestComment(request: UpdatePullRequestCommentRequest): Promise<void> {
        if (!this.isRepositoryNameValid(request.repositoryName)) return Promise.reject(new Error("Invalid repository name"));
        return this.gitHubClient.updatePullRequestComment(request);
    }

    private isRepositoryNameValid(repositoryName: string): boolean {
        return repositoryName.endsWith(this.repositoryNameSuffix);
    }
}
