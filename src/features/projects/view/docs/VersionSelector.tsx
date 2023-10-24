import { Select, MenuItem, SelectChangeEvent, FormControl } from "@mui/material"
import Version from "../../domain/Version"

interface VersionSelectorProps {
  versions: Version[]
  selection: string
  onSelect: (versionId: string) => void
}

const VersionSelector: React.FC<VersionSelectorProps> = ({
  versions,
  selection,
  onSelect
}) => {
  const handleVersionChange = (event: SelectChangeEvent) => {
    onSelect(event.target.value)
  }
  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <Select defaultValue={selection} onChange={handleVersionChange}>
        {versions.map(version => 
          <MenuItem key={version.id} value={version.id}>
            {version.name}
          </MenuItem>
        )}
      </Select>
    </FormControl>
  )
}

export default VersionSelector
