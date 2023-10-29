import { SxProps } from "@mui/system"
import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"

const ThickDivider = ({
  sx
}: {
  sx?: SxProps
}) => {
  const theme = useTheme()
  return (
    <Box sx={{
      ...sx,
      height: "4px",
      background: theme.palette.divider
    }}
    />
  )
}

export default ThickDivider
