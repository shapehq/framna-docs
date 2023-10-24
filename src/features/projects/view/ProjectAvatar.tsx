import { alpha, useTheme } from "@mui/material/styles"
import { SxProps } from "@mui/system"
import { Avatar } from "@mui/material"
import Project from "../domain/Project"

function ProjectAvatar({
  project,
  sx
}: {
  project: Project,
  sx?: SxProps
}) {
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
        alt={project.displayName}
        variant="rounded"
      >
        {Array.from(project.displayName)[0]}
      </Avatar>
    )
  } else {
    return (
      <Avatar sx={sx} alt={project.displayName} variant="rounded">
        {Array.from(project.displayName)[0]}
      </Avatar>
    )
  }
}

export default ProjectAvatar
