"use client"

import { Stack } from "@mui/material"
import Selector from "./Selector"
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
      <Selector
        items={project.versions}
        selection={version.id}
        onSelect={selectVersion}
        sx={{ width: "100%" }}
      />
      <Selector
        items={version.specifications}
        selection={specification.id}
        onSelect={selectSpecification}
        sx={{ width: "100%" }}
      />
    </Stack>
  )
}

export default MobileToolbar
