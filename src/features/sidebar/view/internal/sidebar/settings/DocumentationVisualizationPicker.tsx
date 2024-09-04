"use client"

import { SxProps } from "@mui/system"
import { FormControl, Select, MenuItem, SelectChangeEvent } from "@mui/material"
import MenuItemHover from "@/common/ui/MenuItemHover"
import { softPaperSx } from "@/common/theme/theme"
import { DocumentationVisualizer } from "@/features/settings/domain"
import { useDocumentationVisualizer } from "@/features/settings/data"

const DocumentationVisualizationPicker = ({ sx }: { sx?: SxProps }) => {
  const [value, setValue] = useDocumentationVisualizer()
  const handleChange = (event: SelectChangeEvent) => {
    setValue(parseInt(event.target.value))
  }
  return (
    <FormControl fullWidth sx={{ m: 1, minWidth: 120, margin: 0, ...sx }} size="small">
      <Select
        defaultValue={value.toString()}
        onChange={handleChange}
        MenuProps={{
          sx: {
            margin: 0,
            marginLeft: 1
          },
          anchorOrigin: {
            vertical: "top",
            horizontal: "right"
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "left"
          },
          PaperProps: {
            sx: softPaperSx
          }
        }}
      >
        <MenuItem
          key={DocumentationVisualizer.REDOCLY}
          value={DocumentationVisualizer.REDOCLY.toString()}
        >
          <MenuItemHover>
            Redocly
          </MenuItemHover>
        </MenuItem>
        <MenuItem
          key={DocumentationVisualizer.STOPLIGHT}
          value={DocumentationVisualizer.STOPLIGHT.toString()}
        >
          <MenuItemHover>
            Stoplight
          </MenuItemHover>
        </MenuItem>
        <MenuItem
          key={DocumentationVisualizer.SWAGGER}
          value={DocumentationVisualizer.SWAGGER.toString()}
        >
          <MenuItemHover>
            Swagger
          </MenuItemHover>
        </MenuItem>
      </Select>
    </FormControl>
  )
}

export default DocumentationVisualizationPicker
