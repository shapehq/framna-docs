import { useState } from "react"
import { ToggleButtonGroup, ToggleButton } from "@mui/material"
import DocumentationVisualizer from "../domain/DocumentationVisualizer"
import { settingsStore } from "@/common/client/startup"

const DocumentationVisualizationPicker: React.FC = () => {
  const [value, setValue] = useState(settingsStore.documentationVisualizer)
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    documentationVisualizer: DocumentationVisualizer
  ) => {
    setValue(documentationVisualizer)
    setTimeout(() => {
      settingsStore.documentationVisualizer = documentationVisualizer
    })
  }
  return (
    <ToggleButtonGroup
      exclusive
      value={value.toString()}
      onChange={handleChange}
      fullWidth={true}
      color="secondary"
      aria-label="Viewer"
    >
      <ToggleButton value={DocumentationVisualizer.SWAGGER.toString()}>
        Swagger
      </ToggleButton>
      <ToggleButton value={DocumentationVisualizer.REDOCLY.toString()}>
        Redocly
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default DocumentationVisualizationPicker
