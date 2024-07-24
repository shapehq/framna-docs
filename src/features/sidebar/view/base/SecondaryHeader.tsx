import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Box, Divider, IconButton, Tooltip } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import { isMac, useKeyboardShortcut } from "@/common"

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
  useKeyboardShortcut(event => {
    const isActionKey = isMac() ? event.metaKey : event.ctrlKey
    if (isActionKey && event.key === ".") {
      event.preventDefault()
      if (showOpenSidebar) {
        onToggleSidebarOpen(true)
      } else if (showCloseSidebar) {
        onToggleSidebarOpen(false)
      }
    }
  }, [showOpenSidebar, showCloseSidebar, onToggleSidebarOpen])
  const openCloseShortcutString = isMac() ? " (⌘ + .)" : "(^ + .)"
  const theme = useTheme()
  return (
    <Box
      sx={{
        ...sx,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
        {showOpenSidebar &&
          <Tooltip title={`Show Projects${openCloseShortcutString}`}>
            <IconButton
              color="primary"
              onClick={() => onToggleSidebarOpen(true)}
              edge="start"
            >
              <FontAwesomeIcon icon={faBars} size="sm" style={{ aspectRatio: 1 }} />
            </IconButton>
          </Tooltip>
        }
        {showCloseSidebar &&
          <Tooltip title={`Hide Projects${openCloseShortcutString}`}>
            <IconButton
              color="primary"
              onClick={() => onToggleSidebarOpen(false)}
              edge="start"
            >
              <FontAwesomeIcon icon={faChevronLeft} size="sm" style={{ aspectRatio: 1 }} />
            </IconButton>
          </Tooltip>
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
