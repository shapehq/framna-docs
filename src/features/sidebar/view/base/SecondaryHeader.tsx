import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Box, Divider, IconButton } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faChevronLeft } from "@fortawesome/free-solid-svg-icons"

export default function SecondaryHeader({
  showOpenSidebar,
  showCloseSidebar,
  onToggleSidebarOpen,
  trailingItem,
  children,
  sx
}: {
  showOpenSidebar: boolean
  showCloseSidebar: boolean
  onToggleSidebarOpen: (isOpen: boolean) => void
  trailingItem?: ReactNode
  children?: ReactNode
  sx?: SxProps
}) {
  const theme = useTheme()
  return (
    <Box
      sx={{
        ...sx,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", padding: 2, maxWidth: "1460px", margin: "auto", height: 80 }}>
        {showOpenSidebar &&
          <IconButton
            size="medium"
            color="primary"
            onClick={() => onToggleSidebarOpen(true)}
            edge="start"
          >
            <FontAwesomeIcon icon={faBars} size="sm" style={{ aspectRatio: 1, padding: 2 }} />
          </IconButton>
        }
        {showCloseSidebar &&
          <IconButton
            size="small"
            color="primary"
            onClick={() => onToggleSidebarOpen(false)}
            edge="start"
          >
            <FontAwesomeIcon icon={faChevronLeft} size="sm" style={{ aspectRatio: 1, padding: 2 }} />
          </IconButton>
        }
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "end" }}> 
          {trailingItem}
        </Box>
      </Box>
      {children}
      <Divider />
    </Box>
  )
}
