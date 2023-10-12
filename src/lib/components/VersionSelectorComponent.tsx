"use client";

import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { IVersion } from "../projects/IVersion";
import { useState } from "react";

interface VersionSelectorComponentProps {
  versions: IVersion[];
}

const VersionSelectorComponent: React.FC<VersionSelectorComponentProps> = ({
  versions,
}) => {
  const [version, setVersion] = useState(versions[0].name);

  const handleVersionChange = (event: SelectChangeEvent) => {
    setVersion(event.target.value);
  };

  return (
    <Select
      value={version}
      label="Version"
      onChange={handleVersionChange}
    >
      {versions.map((version, index) => {
        return (
          <MenuItem key={`Version-${index}`} value={version.name}>
            {version.name}
          </MenuItem>
        );
      })}
    </Select>
  );
};

export default VersionSelectorComponent;
