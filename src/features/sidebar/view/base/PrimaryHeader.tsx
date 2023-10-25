import { ReactNode } from "react"
import { Box, IconButton } from "@mui/material"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"

export default function PrimaryHeader({
  canCloseDrawer,
  width,
  onClose,
  children
}: {
  canCloseDrawer: boolean,
  width: number,
  onClose: () => void
  children?: ReactNode
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
      <IconButton
        onClick={onClose}
        sx={{ zIndex: 1000, visibility: canCloseDrawer ? "visible" : "hidden" }}
        edge="start"
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
