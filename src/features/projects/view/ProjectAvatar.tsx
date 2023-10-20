import { alpha, useTheme } from "@mui/material/styles"
import { SxProps } from "@mui/system"
import { Avatar } from "@mui/material"
import IProject from "../domain/IProject"

function PlaceholderProjectAvatar(
  {name, sx}: {name: string, sx?: SxProps}
) {
  return (
    <Avatar sx={{ ...sx}} alt={name}>
      {Array.from(name)[0]}
    </Avatar>
  )
}

function ProjectAvatar<ProjectType extends IProject>(
  {project, sx}: {project: ProjectType, sx?: SxProps}
) {
  const theme = useTheme()
  if (project.imageURL) {
    return (
      <Avatar
        src={project.imageURL}
        sx={{
          ...sx,
          bgcolor: theme.palette.divider,
          border: `1px solid ${alpha(theme.palette.divider, 0.02)}`
        }}
        alt={project.name}
        variant="rounded"
      >
        {Array.from(project.name)[0]}
      </Avatar>
    )
  } else {
    return (
      <PlaceholderProjectAvatar name={project.name} sx={sx} />
    )
  }
}

export default ProjectAvatar
