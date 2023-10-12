import { IUser } from "../auth/IUser";
import { IGitHubVersion } from "../projects/IGitHubVersion";
import { IOpenApiSpecificationRepository } from "../projects/IOpenAPISpecificationRepository";
import { IProject } from "../projects/IProject";
import { IVersion } from "../projects/IVersion";
import OpenApiSpecificationSelectorComponent from "./OpenApiSpecificationSelectorComponent";

interface OpenApiSpecificationsComponentProps {
  version: IVersion;
  project: IProject;
  user: IUser;
  openApiSpecificationRepository: IOpenApiSpecificationRepository;
}

const OpenApiSpecificationsComponent: React.FC<
  OpenApiSpecificationsComponentProps
> = async ({ version, openApiSpecificationRepository, user, project }) => {
  const openApiSpecifications =
    await openApiSpecificationRepository.getOpenAPISpecifications({
      owner: user.userName,
      repository: project.name,
      ...version,
    } as IGitHubVersion);

  return (
    <OpenApiSpecificationSelectorComponent
      openApiSpecifications={openApiSpecifications}
    />
  );
};

export default OpenApiSpecificationsComponent;
