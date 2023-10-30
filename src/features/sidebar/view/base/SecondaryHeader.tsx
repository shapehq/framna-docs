import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Box, Divider, IconButton } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars } from "@fortawesome/free-solid-svg-icons"

export default function SecondaryHeader({
  isOpenSidebarEnabled,
  onOpenSidebar,
  trailingItem,
  children,
  sx
}: {
  isOpenSidebarEnabled: boolean
  onOpenSidebar: () => void
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
        color: theme.palette.text.primary
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
        <IconButton
          color="primary"
          onClick={onOpenSidebar}
          edge="start"
          sx={{ ...(!isOpenSidebarEnabled && { visibility: "hidden" }) }}
        >
          <FontAwesomeIcon icon={faBars} size="sm" style={{ aspectRatio: 1 }} />
        </IconButton>
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "end" }}> 
          {trailingItem}
        </Box>
      </Box>
      {children}
      <Divider />
    </Box>
  )
}
