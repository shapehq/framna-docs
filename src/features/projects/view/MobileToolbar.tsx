import { Stack } from "@mui/material"
import Project from "../domain/Project"
import Version from "../domain/Version"
import OpenApiSpecification from "../domain/OpenApiSpecification"
import VersionSelector from "./docs/VersionSelector"
import SpecificationSelector from "./docs/SpecificationSelector"

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
      sx={{ display: { sm: "none", md: "flex" } }}
    >
      <VersionSelector
        versions={project.versions}
        selection={version.id}
        onSelect={onSelectVersion}
      />
      <SpecificationSelector
        specifications={version.specifications}
        selection={specification.id}
        onSelect={onSelectSpecification}
      />
    </Stack>
  )
}

export default MobileToolbar
