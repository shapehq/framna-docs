import { ReactNode } from "react"
import { Box, IconButton } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"

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
        disabled={!isCloseEnabled}
        onClick={onClose}
        color="primary"
        edge="start"
        sx={{
          zIndex: 1000,
          opacity: isCloseEnabled ? 1 : 0
        }}
      >
        <FontAwesomeIcon icon={faChevronLeft} size="xs" style={{ aspectRatio: 1 }} />
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
