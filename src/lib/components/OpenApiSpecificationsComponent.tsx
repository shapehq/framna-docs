import { IUser } from "../auth/IUser";
import { IGitHubVersion } from "../projects/IGitHubVersion";
import { IOpenApiSpecificationRepository } from "../projects/IOpenAPISpecificationRepository";
import { IProject } from "../projects/IProject";
import { IVersion } from "../projects/IVersion";
import OpenApiSpecificationSelectorComponent from "./OpenApiSpecificationSelectorComponent";

interface OpenApiSpecificationsComponentProps {
  versionName: string;
  projectName: string;
  user: IUser;
  openApiSpecificationRepository: IOpenApiSpecificationRepository;
  specificationName?: string;
}

const OpenApiSpecificationsComponent: React.FC<
  OpenApiSpecificationsComponentProps
> = async ({
  versionName,
  openApiSpecificationRepository,
  user,
  projectName,
  specificationName,
}) => {
  const openApiSpecifications =
    await openApiSpecificationRepository.getOpenAPISpecifications({
      owner: user.userName,
      repository: projectName,
      name: versionName,
    } as IGitHubVersion);

  return (
    <OpenApiSpecificationSelectorComponent
      openApiSpecifications={openApiSpecifications}
      openAPISpecification={specificationName}
    />
  );
};

export default OpenApiSpecificationsComponent;
