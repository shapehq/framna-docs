import { SxProps } from "@mui/system"
import {  Select, MenuItem, SelectChangeEvent, FormControl } from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"
import Version from "../../domain/Version"

const VersionSelector = ({
  versions,
  selection,
  onSelect,
  sx
}: {
  versions: Version[]
  selection: string
  onSelect: (versionId: string) => void,
  sx?: SxProps
}) => {
  const handleVersionChange = (event: SelectChangeEvent) => {
    onSelect(event.target.value)
  }
  return (
    <FormControl sx={{ m: 1, minWidth: 120, margin: 0, ...sx }} size="small">
      <Select
        defaultValue={selection}
        onChange={handleVersionChange}
      >
        {versions.map(version => 
          <MenuItem key={version.id} value={version.id}>
            <MenuItemHover>
              {version.name}
            </MenuItemHover>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  )
}

export default VersionSelector
