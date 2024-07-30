import { SxProps } from "@mui/system"
import { Box } from "@mui/material"
import { getSvgPath } from "figma-squircle"

const ProjectAvatarSquircle = ({
  width,
  height,
  children,
  sx
}: {
  width: number,
  height: number,
  children?: React.ReactNode,
  sx?: SxProps
}) => {
  const svgPath = getSvgPath({
    width,
    height,
    cornerRadius: 12,
    cornerSmoothing: 0.8
  })
  return (
    <Box sx={{ filter: "drop-shadow(0 2px 3px rgba(0, 0, 0, 0.1))" }}>
      <Box sx={{
        width,
        height,
        clipPath: `path('${svgPath}')`,
        ...sx,
      }}>
        {children}
      </Box>
    </Box>
  )
}

export default ProjectAvatarSquircle
