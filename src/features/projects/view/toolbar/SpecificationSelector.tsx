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
        inputProps={{
          IconComponent: () => null,
          sx: {
              paddingTop: { xs: "10px !important", sm: "6px !important" },
              paddingBottom: { xs: "10px !important", sm: "6px !important" },
              paddingLeft: { xs: "15px !important", sm: "12px !important" },
              paddingRight: { xs: "15px !important", sm: "12px !important" },
          }
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
