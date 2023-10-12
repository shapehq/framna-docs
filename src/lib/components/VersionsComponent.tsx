import { IUser } from "../auth/IUser";
import { IGitHubProject } from "../projects/IGitHubProject";
import { IProject } from "../projects/IProject";
import { IVersionRepository } from "../projects/IVersionRepository";
import VersionSelectorComponent from "./VersionSelectorComponent";

interface VersionsComponentProps {
  versionRepository: IVersionRepository;
  project: IProject;
  user: IUser;
}

const VersionsComponent: React.FC<VersionsComponentProps> = async ({
  versionRepository,
  project,
  user,
}) => {
  const versions = await versionRepository.getVersions({
    ...project,
    owner: user.userName,
  } as IGitHubProject);

  return <VersionSelectorComponent versions={versions} />;
};

export default VersionsComponent;
