import { Stack } from "@mui/material"
import Project from "../../domain/Project"
import Version from "../../domain/Version"
import OpenApiSpecification from "../../domain/OpenApiSpecification"
import VersionSelector from "./VersionSelector"
import SpecificationSelector from "./SpecificationSelector"

const MobileToolbar = ({
  project,
  version,
  specification,
  onSelectVersion,
  onSelectSpecification
}: {
  project: Project
  version: Version
  specification: OpenApiSpecification
  onSelectVersion: (versionId: string) => void,
  onSelectSpecification: (specificationId: string) => void
}) => {
  return (
    <Stack
      direction="column"
      spacing={1}
      sx={{ display: { sm: "block", md: "none" } }}
    >
      <VersionSelector
        versions={project.versions}
        selection={version.id}
        onSelect={onSelectVersion}
        sx={{ width: "100%" }}
      />
      <SpecificationSelector
        specifications={version.specifications}
        selection={specification.id}
        onSelect={onSelectSpecification}
        sx={{ width: "100%" }}
      />
    </Stack>
  )
}

export default MobileToolbar
