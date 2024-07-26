import { SxProps } from "@mui/system"
import { Avatar, Box } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import { Project } from "@/features/projects/domain"
import ProjectAvatarSquircle from "./ProjectAvatarSquircle"

function ProjectAvatar({
  project,
  width,
  height
}: {
  project: Project,
  width: number,
  height: number
}) {
  const theme = useTheme()
  const borderRadius = 1
  return (
    <Box sx={{
      width: width + borderRadius * 2,
      height: height + borderRadius * 2,
      position: "relative"
    }}>
      <ProjectAvatarSquircle
        width={width + borderRadius * 2}
        height={height + borderRadius * 2}
        sx={{
          position: "absolute",
          left: borderRadius * -1,
          top: borderRadius * -1,
          background: alpha(theme.palette.divider, 0.07)
        }}
      />
      <ProjectAvatarSquircle width={width} height={height} sx={{ position: "relative" }}>
        <PlaceholderAvatar
          text={project.displayName}
          sx={{ position: "absolute", zIndex: 500 }}
        />
        {project.imageURL &&
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={project.imageURL}
            alt={project.displayName}
            style={{ position: "absolute", zIndex: 1000 }}
          />
        }
      </ProjectAvatarSquircle>
    </Box>
  )
}

export default ProjectAvatar

const PlaceholderAvatar = ({ text, sx }: { text: string, sx?: SxProps }) => {
  return (
    <Avatar sx={sx} alt={text} variant="square">
      {Array.from(text)[0]}
    </Avatar>
  )
}

