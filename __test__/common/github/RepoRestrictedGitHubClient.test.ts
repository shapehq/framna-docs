import { RepoRestrictedGitHubClient } from '@/common/github/RepoRestrictedGitHubClient';
import {
    IGitHubClient,
    AddCommentToPullRequestRequest,
    GetPullRequestCommentsRequest,
    GetPullRequestFilesRequest,
    GetRepositoryContentRequest,
    GraphQLQueryRequest,
    UpdatePullRequestCommentRequest,
} from "@/common";
import { jest } from '@jest/globals';

describe('RepoRestrictedGitHubClient', () => {
    let client: RepoRestrictedGitHubClient;
    const repositoryNameSuffix = '-suffix';

    const gitHubClient: jest.Mocked<IGitHubClient> = {
        graphql: jest.fn(),
        getRepositoryContent: jest.fn(),
        getPullRequestFiles: jest.fn(),
        getPullRequestComments: jest.fn(),
        addCommentToPullRequest: jest.fn(),
        updatePullRequestComment: jest.fn(),
    };

    beforeEach(() => {
        client = new RepoRestrictedGitHubClient({
            repositoryNameSuffix,
            gitHubClient
        });
    });

    it('should delegate graphql request to the underlying client', async () => {
        const request: GraphQLQueryRequest = { query: '' };
        await client.graphql(request);
        expect(gitHubClient.graphql).toHaveBeenCalledWith(request);
    });

    it('should delegate getRepositoryContent to the underlying client', async () => {
        const request: GetRepositoryContentRequest = {
            repositoryName: 'repo-suffix', path: '',
            repositoryOwner: '',
            ref: undefined
        };
        await client.getRepositoryContent(request);
        expect(gitHubClient.getRepositoryContent).toHaveBeenCalledWith(request);
    });

    it('should throw error if suffix is invalid for getRepositoryContent', async () => {
        const request: GetRepositoryContentRequest = {
            repositoryName: 'repo', path: '',
            repositoryOwner: '',
            ref: undefined
        };
        await expect(client.getRepositoryContent(request)).rejects.toThrow("Invalid repository name");
    });

    it('should delegate getPullRequestFiles to the underlying client', async () => {
        const request: GetPullRequestFilesRequest = {
            repositoryName: 'repo-suffix', pullRequestNumber: 1,
            appInstallationId: 0,
            repositoryOwner: ''
        };
        await client.getPullRequestFiles(request);
        expect(gitHubClient.getPullRequestFiles).toHaveBeenCalledWith(request);
    });

    it('should throw error if suffix is invalid for getPullRequestFiles', async () => {
        const request: GetPullRequestFilesRequest = {
            repositoryName: 'repo', pullRequestNumber: 1,
            appInstallationId: 0,
            repositoryOwner: ''
        };
        await expect(client.getPullRequestFiles(request)).rejects.toThrow("Invalid repository name");
    });

    it('should delegate getPullRequestComments to the underlying client', async () => {
        const request: GetPullRequestCommentsRequest = {
            repositoryName: 'repo-suffix', pullRequestNumber: 1,
            appInstallationId: 0,
            repositoryOwner: ''
        };
        await client.getPullRequestComments(request);
        expect(gitHubClient.getPullRequestComments).toHaveBeenCalledWith(request);
    });

    it('should throw error if suffix is invalid for getPullRequestComments', async () => {
        const request: GetPullRequestCommentsRequest = {
            repositoryName: 'repo', pullRequestNumber: 1,
            appInstallationId: 0,
            repositoryOwner: ''
        };
        await expect(client.getPullRequestComments(request)).rejects.toThrow("Invalid repository name");
    });

    it('should delegate addCommentToPullRequest to the underlying client', async () => {
        const request: AddCommentToPullRequestRequest = {
            repositoryName: 'repo-suffix', pullRequestNumber: 1, body: '',
            appInstallationId: 0,
            repositoryOwner: ''
        };
        await client.addCommentToPullRequest(request);
        expect(gitHubClient.addCommentToPullRequest).toHaveBeenCalledWith(request);
    });

    it('should throw error if suffix is invalid for addCommentToPullRequest', async () => {
        const request: AddCommentToPullRequestRequest = {
            repositoryName: 'repo', pullRequestNumber: 1, body: '',
            appInstallationId: 0,
            repositoryOwner: ''
        };
        await expect(client.addCommentToPullRequest(request)).rejects.toThrow("Invalid repository name");
    });

    it('should delegate updatePullRequestComment to the underlying client', async () => {
        const request: UpdatePullRequestCommentRequest = {
            repositoryName: 'repo-suffix', commentId: 1, body: '',
            appInstallationId: 0,
            repositoryOwner: ''
        };
        await client.updatePullRequestComment(request);
        expect(gitHubClient.updatePullRequestComment).toHaveBeenCalledWith(request);
    });

    it('should throw error if suffix is invalid for updatePullRequestComment', async () => {
        const request: UpdatePullRequestCommentRequest = {
            repositoryName: 'repo', commentId: 1, body: '',
            appInstallationId: 0,
            repositoryOwner: ''
        };
        await expect(client.updatePullRequestComment(request)).rejects.toThrow("Invalid repository name");
    });
});
