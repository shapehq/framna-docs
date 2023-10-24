import { alpha, useTheme } from "@mui/material/styles"
import { SxProps } from "@mui/system"
import { Avatar } from "@mui/material"
import IProject from "../domain/IProject"

function ProjectAvatar({
  project,
  sx
}: {
  project: IProject,
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
        alt={project.displayName || project.name}
        variant="rounded"
      >
        {Array.from(project.displayName || project.name)[0]}
      </Avatar>
    )
  } else {
    return (
      <Avatar sx={sx} alt={project.displayName || project.name} variant="rounded">
        {Array.from(project.displayName || project.name)[0]}
      </Avatar>
    )
  }
}

export default ProjectAvatar
