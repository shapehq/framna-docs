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
import VersionsComponent from "@/lib/components/VersionsComponent";
import OpenApiSpecificationsComponent from "@/lib/components/OpenApiSpecificationsComponent";
import { GitHubOpenApiSpecificationRepository } from "@/lib/projects/GitHubOpenAPISpecificationRepository";

export default async function Page() {
  const organizationNameProvider = new HardcodedGitHubOrganizationNameProvider(
    "shapehq"
  );
  const userProvider = new Auth0UserProvider();
  const userDetailsProvider = new Auth0UserDetailsProvider(userProvider, {
    domain: process.env.AUTH0_MANAGEMENT_DOMAIN,
    clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
    clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
  });
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
  const projectRepository = new GitHubProjectRepository(gitHubClient);
  const user = await userProvider.getUser();

  const project = {
    name: "test-openapi",
  };
  return (
    <App
      userComponent={<UserComponent user={user} />}
      projectListComponent={
        <ProjectListComponent projectRepository={projectRepository} />
      }
      versionSelectorComponent={
        <VersionsComponent
          versionRepository={new GitHubVersionRepository(gitHubClient)}
          project={project}
          user={user}
        />
      }
      openApiSpecificationsComponent={
        <OpenApiSpecificationsComponent
          openApiSpecificationRepository={
            new GitHubOpenApiSpecificationRepository(gitHubClient)
          }
          project={project}
          version={{
            name: "main",
          }}
          user={user}
        />
      }
    >
      {/* <WelcomePage /> */}
      <DocumentationViewerPage
        openApiSpecification={{
          name: "main",
          url: "https://raw.githubusercontent.com/shapehq/test-openapi/main/test.yaml?token=BBUWR3NJGFPDMHZYF5QQZFDFFBQAS",
        }}
      />
    </App>
  );
}
