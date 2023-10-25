import { ReactNode } from "react"
import { Box, IconButton } from "@mui/material"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { styled } from "@mui/material/styles"

const PrimaryHeaderWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}))

export default function PrimaryHeader({
  width,
  onClose,
  children
}: {
  width: number,
  onClose: () => void
  children?: ReactNode
}) {
  return (
    <PrimaryHeaderWrapper>
      <IconButton
        onClick={onClose}
        sx={{ marginLeft: "2px", zIndex: 1000 }}
      >
        <ChevronLeftIcon />
      </IconButton>
      {children != null && 
        <Box sx={{ 
          position: "fixed",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: `${width}px`
        }}>
          {children}
        </Box>
      }
    </PrimaryHeaderWrapper>
  )
}
