"use client"

import { Stack } from "@mui/material"
import VersionSelector from "./VersionSelector"
import SpecificationSelector from "./SpecificationSelector"
import { useProjectSelection } from "../../data"

const MobileToolbar = () => {
  const {
    project,
    version,
    specification,
    selectVersion,
    selectSpecification
  } = useProjectSelection()
  if (!project || !version || !specification) {
    return <></>
  }
  return (
    <Stack
      direction="column"
      spacing={1}
      sx={{ display: { sm: "block", md: "none" } }}
    >
      <VersionSelector
        versions={project.versions}
        selection={version.id}
        onSelect={selectVersion}
        sx={{ width: "100%" }}
      />
      <SpecificationSelector
        specifications={version.specifications}
        selection={specification.id}
        onSelect={selectSpecification}
        sx={{ width: "100%" }}
      />
    </Stack>
  )
}

export default MobileToolbar
