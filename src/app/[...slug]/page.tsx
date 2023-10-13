import ProjectListComponent from "@/lib/components/ProjectListComponent";
import UserComponent from "@/lib/components/UserComponent";
import DocumentationViewerPage from "@/lib/pages/DocumentationViewerPage";
import {
  userProvider,
  projectRepository,
  gitHubOpenApiSpecificationRepository,
  githubVersionRepository,
} from "../startup";
import App from "@/lib/pages/App";
import OpenApiSpecificationsComponent from "@/lib/components/OpenApiSpecificationsComponent";
import VersionsComponent from "@/lib/components/VersionsComponent";
import { getProject, getSpecification, getVersion } from "@/lib/utils/UrlUtils";
import { IOpenApiSpecification } from "@/lib/projects/IOpenApiSpecification";
import WelcomePage from "@/lib/pages/WelcomePage";
import { type } from "os";

export default async function Page({
  params,
}: {
  params: { slug: string | string[] };
}) {
  const user = await userProvider.getUser();
  let url: string;
  if (typeof params.slug === "string") {
    url = "/" + params.slug;
  } else {
    url = params.slug.reduce(
      (previousValue, currentValue) => `${previousValue}/${currentValue}`,
      ""
    );
  }
  let openApiSpecification: IOpenApiSpecification | undefined;
  const projectName = getProject(url);
  const versionName = getVersion(url);
  const specificationName = getSpecification(url);
  if (projectName && versionName && specificationName) {
    const specifications =
      await gitHubOpenApiSpecificationRepository.getOpenAPISpecifications({
        name: versionName,
        owner: "shapehq",
        repository: projectName,
      });
    openApiSpecification = specifications.find(
      (x) => x.name == specificationName
    );
  }

  return (
    <App
      userComponent={<UserComponent user={user} />}
      projectListComponent={
        <ProjectListComponent projectRepository={projectRepository} />
      }
      {...(projectName && projectName.length > 0
        ? {
            versionSelectorComponent: (
              <VersionsComponent
                versionRepository={githubVersionRepository}
                projectName={projectName}
                versionName={versionName}
                user={user}
              />
            ),
          }
        : {})}
      {...(projectName &&
      projectName.length > 0 &&
      versionName &&
      versionName.length > 0
        ? {
            openApiSpecificationsComponent: (
              <OpenApiSpecificationsComponent
                openApiSpecificationRepository={
                  gitHubOpenApiSpecificationRepository
                }
                projectName={projectName}
                versionName={versionName}
                specificationName={specificationName}
                user={user}
              />
            ),
          }
        : {})}
    >
      {openApiSpecification ? (
        <DocumentationViewerPage openApiSpecification={openApiSpecification} />
      ) : (
        <WelcomePage />
      )}
    </App>
  );
}
