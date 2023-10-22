import { ToggleButtonGroup, ToggleButton } from "@mui/material"
import DocumentationVisualizer from "../domain/DocumentationVisualizer"
import useDocumentationVisualizer from "@/features/settings/data/useDocumentationVisualizer"

const DocumentationVisualizationPicker: React.FC = () => {
  const [value, setValue] = useDocumentationVisualizer()
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    documentationVisualizer: DocumentationVisualizer
  ) => {
    setValue(documentationVisualizer)
  }
  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={handleChange}
      fullWidth={true}
      color="secondary"
      aria-label="Viewer"
    >
      <ToggleButton value={DocumentationVisualizer.SWAGGER}>
        Swagger
      </ToggleButton>
      <ToggleButton value={DocumentationVisualizer.REDOCLY}>
        Redocly
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default DocumentationVisualizationPicker
