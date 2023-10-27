import { FormControl, Select, MenuItem, SelectChangeEvent } from "@mui/material"
import DocumentationVisualizer from "../domain/DocumentationVisualizer"
import useDocumentationVisualizer from "@/features/settings/data/useDocumentationVisualizer"

const DocumentationVisualizationPicker: React.FC = () => {
  const [value, setValue] = useDocumentationVisualizer()
  const handleChange = (event: SelectChangeEvent) => {
    setValue(parseInt(event.target.value))
  }
  return (
    <FormControl fullWidth sx={{ m: 1, minWidth: 120, margin: 0 }} size="small">
      <Select defaultValue={value.toString()} onChange={handleChange}>
        <MenuItem
          key={DocumentationVisualizer.REDOCLY}
          value={DocumentationVisualizer.REDOCLY.toString()}
        >
          Redocly
        </MenuItem>
        <MenuItem
          key={DocumentationVisualizer.STOPLIGHT}
          value={DocumentationVisualizer.STOPLIGHT.toString()}
        >
          Stoplight
        </MenuItem>
        <MenuItem
          key={DocumentationVisualizer.SWAGGER}
          value={DocumentationVisualizer.SWAGGER.toString()}
        >
          Swagger
        </MenuItem>
      </Select>
    </FormControl>
  )
}

export default DocumentationVisualizationPicker
