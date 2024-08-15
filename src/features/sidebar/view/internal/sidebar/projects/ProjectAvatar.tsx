import { Box, SxProps } from "@mui/system"
import { Avatar } from "@mui/material"
import { Project } from "@/features/projects/domain"
import { getSvgPath } from "figma-squircle"

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
    <StrokedSquircle width={width} height={height}>
      <Placeholder
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
    </StrokedSquircle>
  )
}

export default ProjectAvatar

const Placeholder = ({ text, sx }: { text: string, sx?: SxProps }) => {
  return (
    <Avatar sx={sx} alt={text} variant="square">
      {Array.from(text)[0]}
    </Avatar>
  )
}

const StrokedSquircle = ({
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
  const strokeWidth = 0.5
  const svgPath = getSvgPath({
    width: width - strokeWidth, 
    height: height - strokeWidth,
    cornerRadius: 12,
    cornerSmoothing: 0.8
  })
  return (
    <Box sx={{ position: "relative", width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 1
        }}
      >
        <path
          d={svgPath}
          fill="none"
          stroke="rgba(0, 0, 0, 0.05)"
          strokeWidth={strokeWidth}
          transform={`translate(${strokeWidth / 2}, ${strokeWidth / 2})`}
        />
      </svg>
      <Box sx={{
        width,
        height,
        clipPath: `path('${svgPath}')`,
        position: "relative",
        zIndex: 0,
        ...sx
      }}>
        {children}
      </Box>
    </Box>
  )
}
