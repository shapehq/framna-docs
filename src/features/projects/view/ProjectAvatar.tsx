import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Avatar, Box } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import { getSvgPath } from "figma-squircle"
import Project from "../domain/Project"

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
      <SquircleClip width={width + borderRadius * 2} height={height + borderRadius * 2} sx={{
        position: "absolute",
        left: borderRadius * -1,
        top: borderRadius * -1,
        background: alpha(theme.palette.divider, 0.07)
      }}
      />
      <SquircleClip width={width} height={height} sx={{ position: "relative" }}>
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
      </SquircleClip>
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

const SquircleClip = ({
  width,
  height,
  children,
  sx
}: {
  width: number,
  height: number,
  children?: ReactNode,
  sx?: SxProps
}) => {
  const svgPath = getSvgPath({
    width,
    height,
    cornerRadius: 10,
    cornerSmoothing: 0.8
  })
  return (
    <Box sx={{ ...sx, width, height, clipPath: `path('${svgPath}')` }}>
      {children}
    </Box>
  )
}
