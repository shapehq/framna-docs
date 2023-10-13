import { Auth0UserProvider } from "@/lib/auth/Auth0UserProvider";
import { Auth0UserDetailsProvider } from "@/lib/auth/Auth0UserDetailsProvider";
import { GitHubProjectRepository } from "@/lib/projects/GitHubProjectRepository";
import { IdentityAccessTokenProvider } from "@/lib/auth/IdentityAccessTokenProvider";
import UserComponent from "@/lib/components/UserComponent";
import ProjectListComponent from "@/lib/components/ProjectListComponent";
import App from "@/lib/pages/App";
import DocumentationViewerPage from "@/lib/pages/DocumentationViewerPage";
import NotFoundPage from "@/lib/pages/NotFoundPage";
import { DeferredGitHubClient } from "@/lib/github/DeferredGitHubClient";
import { HardcodedGitHubOrganizationNameProvider } from "@/lib/github/HardcodedGitHubOrganizationNameProvider";
import { OctokitGitHubClient } from "@/lib/github/OctokitGitHubClient";
import VersionSelectorComponent from "@/lib/components/VersionSelectorComponent";
import { GitHubVersionRepository } from "@/lib/projects/GitHubVersionRepository";
import WelcomePage from "@/lib/pages/WelcomePage";
import { AxiosNetworkClient } from "@/lib/networking/AxiosNetworkClient"

export default async function Page() {
  const organizationNameProvider = new HardcodedGitHubOrganizationNameProvider(
    "shapehq"
  );
  const userDetailsProvider = new Auth0UserDetailsProvider(
    new Auth0UserProvider(),
    {
      domain: process.env.AUTH0_MANAGEMENT_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    }
  );
  const accessTokenProvider = new IdentityAccessTokenProvider(
    userDetailsProvider,
    "github"
  );
  const gitHubClientFactory = (
    accessToken: string,
    organizationName: string
  ) => {
    return new OctokitGitHubClient(accessToken, organizationName);
  };
  const gitHubClient = new DeferredGitHubClient(
    organizationNameProvider,
    accessTokenProvider,
    gitHubClientFactory
  );
  const networkClient = new AxiosNetworkClient()
  const projectRepository = new GitHubProjectRepository(gitHubClient, networkClient);
  const userProvider = new Auth0UserProvider();

  return (
    <App
      userComponent={<UserComponent userProvider={userProvider} />}
      projectListComponent={
        <ProjectListComponent projectRepository={projectRepository} />
      }
      // versionSelectorComponent={
      //   <VersionSelectorComponent
      //     versionRepository={new GitHubVersionRepository(gitHubClient)}
      //     project={undefined}
      //   />
      // }
    >
      {/* <WelcomePage /> */}
      <DocumentationViewerPage url="https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/api-with-examples.yaml" />
    </App>
  );
}
