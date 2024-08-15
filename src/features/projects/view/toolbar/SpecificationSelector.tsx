import { SxProps } from "@mui/system"
import {
  SelectChangeEvent,
  Select,
  MenuItem,
  FormControl,
  Typography
} from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"
import { OpenApiSpecification } from "../../domain"

const SpecificationSelector = ({
  specifications,
  selection,
  onSelect,
  sx
}: {
  specifications: OpenApiSpecification[]
  selection: string
  onSelect: (specificationId: string) => void
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
        {specifications.map(specification =>
          <MenuItem key={specification.id} value={specification.id}>
            <MenuItemHover>
              <Typography sx={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis"
              }}>
                {specification.name}
              </Typography>
            </MenuItemHover>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  )
}

export default SpecificationSelector
