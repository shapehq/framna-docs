import { Auth0UserProvider } from "@/lib/auth/Auth0UserProvider";
import { Auth0UserDetailsProvider } from "@/lib/auth/Auth0UserDetailsProvider";
import { GitHubProjectRepository } from "@/lib/projects/GitHubProjectRepository";
import { IdentityAccessTokenProvider } from "@/lib/auth/IdentityAccessTokenProvider";
import SwaggerComponent from "@/lib/components/SwaggerComponent";
import { Divider, List, Toolbar } from "@mui/material";
import RedoclyComponent from "@/lib/components/RedoclyComponent";
import UserComponent from "@/lib/components/UserComponent";
import ProjectListComponent from "@/lib/components/ProjectListComponent";
import FrontPage from "@/lib/pages/FrontPage";
import DocumentationViewerPage from "@/lib/pages/DocumentationViewerPage";
import NotFoundPage from "@/lib/pages/NotFoundPage";

export default async function Page() {
  return (
    <>
      <FrontPage
        userComponent={<UserComponent userProvider={new Auth0UserProvider()} />}
        projectListComponent={
          <ProjectListComponent
            projectRepository={
              new GitHubProjectRepository(
                new IdentityAccessTokenProvider(
                  new Auth0UserDetailsProvider(new Auth0UserProvider(), {
                    domain: process.env.AUTH0_MANAGEMENT_DOMAIN,
                    clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
                    clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
                  }),
                  "github"
                )
              )
            }
          />
        }
      >
        <DocumentationViewerPage url="https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/api-with-examples.yaml" />
        {/* <NotFoundPage /> */}
      </FrontPage>
    </>
  );
}
