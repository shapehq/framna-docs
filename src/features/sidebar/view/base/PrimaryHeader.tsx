import { ReactNode } from "react"
import { Box, IconButton } from "@mui/material"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"

export default function PrimaryHeader({
  isCloseEnabled,
  width,
  onClose,
  children
}: {
  isCloseEnabled: boolean,
  width: number,
  onClose: () => void
  children?: ReactNode
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
      <IconButton
        onClick={onClose}
        edge="start"
        disabled={!isCloseEnabled}
        sx={{
          zIndex: 1000,
          opacity: isCloseEnabled ? 1 : 0
        }}
      >
        <ChevronLeftIcon/>
      </IconButton>
      <Box
        sx={{ 
          position: "fixed",
          left: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: `${width}px`
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
