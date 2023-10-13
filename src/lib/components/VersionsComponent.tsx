import { IUser } from "../auth/IUser";
import { IGitHubProject } from "../projects/IGitHubProject";
import { IProject } from "../projects/IProject";
import { IVersionRepository } from "../projects/IVersionRepository";
import VersionSelectorComponent from "./VersionSelectorComponent";

interface VersionsComponentProps {
  versionRepository: IVersionRepository;
  projectName: string;
  versionName?: string;
  user: IUser;
}

const VersionsComponent: React.FC<VersionsComponentProps> = async ({
  versionRepository,
  projectName,
  versionName,
  user,
}) => {
  const versions = await versionRepository.getVersions({
    name: projectName,
    owner: "shapehq",
  } as IGitHubProject);

  return <VersionSelectorComponent versions={versions} version={versionName} />;
};

export default VersionsComponent;
