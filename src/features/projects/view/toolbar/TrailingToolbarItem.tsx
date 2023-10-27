import { SxProps } from "@mui/system"
import { Stack, IconButton, Typography, Link } from "@mui/material"
import Project from "../../domain/Project"
import Version from "../../domain/Version"
import OpenApiSpecification from "../../domain/OpenApiSpecification"
import VersionSelector from "./VersionSelector"
import SpecificationSelector from "./SpecificationSelector"
import EditIcon from "@mui/icons-material/Edit"

const TrailingToolbarItem = ({
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
    <>
      <Stack
        direction="row"
        alignItems="center"
        sx={{ display: { sm: "flex", md: "none" } }}
      >
        <ProjectName text={project.name} url={version.url} />
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        sx={{ display: { xs: "none", sm: "none", md: "flex" } }}
      >
        <ProjectName text={project.name} url={version.url} sx={{ marginRight: 1 }} /> 
        <Typography variant="h6" sx={{ marginRight: 1 }}>/</Typography>
        <VersionSelector
          versions={project.versions}
          selection={version.id}
          onSelect={onSelectVersion}
          sx={{ marginRight: 1 }}
        />
        <Typography variant="h6" sx={{ marginRight: 1 }}>/</Typography>
        <SpecificationSelector
          specifications={version.specifications}
          selection={specification.id}
          onSelect={onSelectSpecification}
          sx={{ marginRight: 1 }}
        />
        {specification.editURL &&
          <IconButton
            href={specification.editURL}
            target="_blank"
            edge="end"
          >
            <EditIcon/>
          </IconButton>
        }
      </Stack>
    </>
  )
}

export default TrailingToolbarItem

const ProjectName = ({
  url,
  text,
  sx
}: {
  url?: string
  text: string
  sx?: SxProps
}) => {
  if (url) {
    return (
      <Link
        variant="body1"
        color="inherit"
        underline="hover"
        href={url}
        target="_blank"
        sx={sx}
      >
        {text}
      </Link>
    )
  } else {
    return (
      <Typography variant="body1">
        {text}
      </Typography>
    )
  }
}