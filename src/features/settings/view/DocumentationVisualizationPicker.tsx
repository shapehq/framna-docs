"use client"

import { useState } from "react"
import Image from "next/image"
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
    >
      <ToggleButton value={DocumentationVisualizer.SWAGGER.toString()}>
        <Image src="/swagger.png" alt="Swagger" width={24} height={24} />
      </ToggleButton>
      <ToggleButton value={DocumentationVisualizer.REDOCLY.toString()}>
        <Image src="/redocly.png" alt="Redocly" width={24} height={24} />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default DocumentationVisualizationPicker
