import { IGitHubProject } from "../projects/IGitHubProject";
import { IVersionRepository } from "../projects/IVersionRepository";
import VersionSelectorComponent from "./VersionSelectorComponent";

interface VersionsComponentProps {
  versionRepository: IVersionRepository;
  projectName: string;
  versionName?: string;
}

const VersionsComponent: React.FC<VersionsComponentProps> = async ({
  versionRepository,
  projectName,
  versionName
}) => {
  const versions = await versionRepository.getVersions({
    name: projectName,
    owner: "shapehq",
  } as IGitHubProject);

  return (
    <VersionSelectorComponent
      versions={versions}
      version={versionName}
      projectName={projectName}
    />
  );
};

export default VersionsComponent;
