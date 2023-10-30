import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Box } from "@mui/material"
import { getSvgPath } from "figma-squircle"

const ProjectAvatarSquircleClip = ({
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

export default ProjectAvatarSquircleClip