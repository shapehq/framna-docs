import { SxProps } from "@mui/system"
import { SelectChangeEvent, Select, MenuItem, FormControl } from "@mui/material"
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
    <FormControl sx={{ m: 1, minWidth: 120, margin: 0, ...sx }} size="small">
      <Select defaultValue={selection} onChange={handleVersionChange}>
        {specifications.map(specification =>
          <MenuItem key={specification.id} value={specification.id}>
            <MenuItemHover>
              {specification.name}
            </MenuItemHover>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  )
}

export default SpecificationSelector
