import { SxProps } from "@mui/system"
import { Avatar } from "@mui/material"
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
  return (
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
