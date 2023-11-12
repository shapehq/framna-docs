import { SxProps } from "@mui/system"
import { Stack, IconButton, Typography, Link } from "@mui/material"
import { Project, Version, OpenApiSpecification } from "../../domain"
import VersionSelector from "./VersionSelector"
import SpecificationSelector from "./SpecificationSelector"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPen } from "@fortawesome/free-solid-svg-icons"

const TrailingToolbarItem = ({
  enableGitHubLinks,
  project,
  version,
  specification,
  onSelectVersion,
  onSelectSpecification
}: {
  enableGitHubLinks: boolean,
  project: Project
  version: Version
  specification: OpenApiSpecification
  onSelectVersion: (versionId: string) => void,
  onSelectSpecification: (specificationId: string) => void
}) => {
  const projectNameURL = enableGitHubLinks ? version.url || project.url : undefined
  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        sx={{ display: { sm: "flex", md: "none" } }}
      >
        <ProjectName text={project.name} url={projectNameURL} />
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        sx={{ display: { xs: "none", sm: "none", md: "flex" } }}
      >
        <ProjectName
          text={project.name}
          url={projectNameURL}
          sx={{ marginRight: 1 }}
        /> 
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
          sx={{ marginRight: 0.5 }}
        />
        {enableGitHubLinks && specification.editURL &&
          <IconButton
            href={specification.editURL}
            target="_blank"
            color="primary"
            edge="end"
          >
            <FontAwesomeIcon icon={faPen} size="xs" style={{ aspectRatio: 1, padding: 2 }} />
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
      <Typography variant="body1" sx={sx}>
        {text}
      </Typography>
    )
  }
}