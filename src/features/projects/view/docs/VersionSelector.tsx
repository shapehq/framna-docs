"use client";

import { useRouter } from "next/navigation"
import { MenuItem, Select, SelectChangeEvent } from "@mui/material"
import IVersion from "../../domain/IVersion"

interface VersionSelectorProps {
  versions: IVersion[]
  selectedVersionId?: string
  selectedProjectId: string
}

const VersionSelector: React.FC<VersionSelectorProps> = ({
  versions,
  selectedVersionId,
  selectedProjectId
}) => {
  const router = useRouter()
  const handleVersionChange = (event: SelectChangeEvent) => {
    const versionId = event.target.value
    router.push(`/${selectedProjectId}/${versionId}`)
  }
  return (
    <Select
      value={selectedVersionId} 
      label="Version" 
      onChange={handleVersionChange}
      sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 } }}
      autoWidth
    >
      {versions.map(version => {
        return (
          <MenuItem key={version.id} value={version.id}>
            {version.name}
          </MenuItem>
        )
      })}
    </Select>
  )
}

export default VersionSelector
