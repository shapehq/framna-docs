import { IGitHubVersion } from "../projects/IGitHubVersion";
import { IOpenApiSpecificationRepository } from "../projects/IOpenAPISpecificationRepository";
import OpenApiSpecificationSelectorComponent from "./OpenApiSpecificationSelectorComponent";

interface OpenApiSpecificationsComponentProps {
  versionName: string;
  projectName: string;
  openApiSpecificationRepository: IOpenApiSpecificationRepository;
  specificationName?: string;
}

const OpenApiSpecificationsComponent: React.FC<
  OpenApiSpecificationsComponentProps
> = async ({
  versionName,
  openApiSpecificationRepository,
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
      projectName={projectName}
      versionName={versionName}
    />
  );
};

export default OpenApiSpecificationsComponent;
