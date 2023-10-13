import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { IVersionRepository } from "../projects/IVersionRepository";
import { IProject } from "../projects/IProject";
import { useState } from "react";

interface VersionSelectorComponentProps {
  versionRepository: IVersionRepository;
  project: IProject;
}

const VersionSelectorComponent: React.FC<
  VersionSelectorComponentProps
> = async ({ versionRepository, project }) => {
  const versions = await versionRepository.getVersions(project);
  const [version, setVersion] = useState(versions[0].name);

  const handleVersionChange = (event: SelectChangeEvent) => {
    setVersion(event.target.value);
  };

  return (
    <Select
      labelId="demo-simple-select-label"
      id="demo-simple-select"
      value={version}
      label="Age"
      onChange={handleVersionChange}
    >
      {versions.map((version, index) => {
        return <MenuItem key={index} value={version.name}>{version.name}</MenuItem>;
      })}
    </Select>
  );
};

export default VersionSelectorComponent;
