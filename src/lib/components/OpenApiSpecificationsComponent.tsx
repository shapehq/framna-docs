import { IUser } from "../auth/IUser";
import { IGitHubVersion } from "../projects/IGitHubVersion";
import { IOpenApiSpecificationRepository } from "../projects/IOpenApiSpecificationRepository";
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
      owner: "shapehq",
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
