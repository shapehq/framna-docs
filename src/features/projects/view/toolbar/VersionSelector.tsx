import { SxProps } from "@mui/system"
import {
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  Typography
} from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"
import { Version } from "../../domain"

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
    <FormControl sx={{ m: 1, margin: 0, ...sx }} size="small">
      <Select
        defaultValue={selection}
        onChange={handleVersionChange}
        sx={{ padding: 1, paddingLeft: 1.5, paddingRight: 1.5 }}
        inputProps={{
          IconComponent: () => null,
          sx: { padding: "0 !important" }
        }}
      >
        {versions.map(version => 
          <MenuItem key={version.id} value={version.id}>
            <MenuItemHover>
              <Typography sx={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis"
              }}>
                {version.name}
              </Typography>
            </MenuItemHover>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  )
}

export default VersionSelector
