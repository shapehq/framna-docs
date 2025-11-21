'use client'

import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles" 

const RightContainer = ({
  width,
  isOpen,
  onClose: _onClose,
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
        backgroundColor: theme.palette.background.default,
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  )
}

export default RightContainer