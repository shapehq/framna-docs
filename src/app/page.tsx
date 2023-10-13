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
import { projectRepository, userProvider } from "./startup";

export default async function Page() {
  const user = await userProvider.getUser();
  return (
    <App
      userComponent={<UserComponent user={user} />}
      projectListComponent={
        <ProjectListComponent projectRepository={projectRepository} />
      }
    >
      <WelcomePage />
    </App>
  );
}
