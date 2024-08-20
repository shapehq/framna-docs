"use client"

import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"

const SidebarDivider = () => {
  const theme = useTheme()
  return (
    <Box sx={{
      height: "0.5px",
      marginLeft: 1,
      marginRight: 1,
      background: theme.palette.divider
    }} />
  )
}

export default SidebarDivider
