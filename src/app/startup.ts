import { Auth0UserDetailsProvider } from "@/lib/auth/Auth0UserDetailsProvider";
import { Auth0UserProvider } from "@/lib/auth/Auth0UserProvider";
import { IdentityAccessTokenProvider } from "@/lib/auth/IdentityAccessTokenProvider";
import { DeferredGitHubClient } from "@/lib/github/DeferredGitHubClient";
import { HardcodedGitHubOrganizationNameProvider } from "@/lib/github/HardcodedGitHubOrganizationNameProvider";
import { OctokitGitHubClient } from "@/lib/github/OctokitGitHubClient";
import { GitHubOpenApiSpecificationRepository } from "@/lib/projects/GitHubOpenAPISpecificationRepository";
import { GitHubProjectRepository } from "@/lib/projects/GitHubProjectRepository";
import { GitHubVersionRepository } from "@/lib/projects/GitHubVersionRepository";

export const organizationNameProvider = new HardcodedGitHubOrganizationNameProvider(
    "shapehq"
);
export const userProvider = new Auth0UserProvider();
export const userDetailsProvider = new Auth0UserDetailsProvider(userProvider, {
    domain: process.env.AUTH0_MANAGEMENT_DOMAIN,
    clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
    clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
});
export const accessTokenProvider = new IdentityAccessTokenProvider(
    userDetailsProvider,
    "github"
);
export const gitHubClientFactory = (
    accessToken: string,
    organizationName: string
) => {
    return new OctokitGitHubClient(accessToken, organizationName);
};
export const gitHubClient = new DeferredGitHubClient(
    organizationNameProvider,
    accessTokenProvider,
    gitHubClientFactory
);
export const projectRepository = new GitHubProjectRepository(gitHubClient);
export const githubVersionRepository = new GitHubVersionRepository(gitHubClient);
export const gitHubOpenApiSpecificationRepository =
    new GitHubOpenApiSpecificationRepository(gitHubClient);