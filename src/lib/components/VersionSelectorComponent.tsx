"use client";

import { MenuItem, Select, SelectChangeEvent, Divider } from "@mui/material";
import { IVersion } from "../projects/IVersion";
import { useState } from "react";
import { getProject, getVersion } from "../utils/UrlUtils";
import { publish } from "../utils/EventsUtils";
import { Events } from "../events/BaseEvent";
import VersionChangedEvent from "../events/VersionChangedEvent";
import { useRouter } from "next/navigation";

interface VersionSelectorComponentProps {
  versions: IVersion[];
  version?: string;
}

const VersionSelectorComponent: React.FC<VersionSelectorComponentProps> = ({
  versions,
  version
}) => {
  const router = useRouter();

  const handleVersionChange = (event: SelectChangeEvent) => {
    const versionName = event.target.value;
    router.push(`/${getProject()}/${versionName}`);
  };

  return (
    <Select
      value={version} 
      label="Version" 
      onChange={handleVersionChange}
      sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 } }}
      autoWidth
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
