"use client"

import { ReactNode } from "react"
import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"

export default function TrailingToolbar({
  children
}: {
  children?: ReactNode
}) {
  const theme = useTheme()
  return (
    <Box sx={{ 
      display: "flex",
      width: "100%",
      justifyContent: "right",
      color: theme.palette.text.primary
    }}>
      {children}
    </Box>
  )
}
