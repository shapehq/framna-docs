'use client'

import { SxProps } from "@mui/system"
import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles" 

const DiffContainer = ({
  width,
  isOpen,
  onClose,
  children
}: {
  width: number
  isOpen: boolean
  onClose?: () => void
  children?: React.ReactNode
}) => {
  const theme = useTheme()
  
  if (!isOpen) {
    return null
  }
  
  return (
    <Box
      sx={{
        width: width,
        height: "100%",
        borderLeft: `1px ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.default,
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  )
}

export default DiffContainer