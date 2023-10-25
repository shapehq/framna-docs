import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Box, Divider, IconButton } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import MenuIcon from "@mui/icons-material/Menu"

export default function SecondaryHeader({
  showOpenDrawer,
  onOpenDrawer,
  trailingItem,
  children,
  sx
}: {
  showOpenDrawer: boolean
  onOpenDrawer: () => void
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
          color="inherit"
          onClick={onOpenDrawer}
          edge="start"
          sx={{
            mr: 2,
            color: theme.palette.text.primary,
            ...(!showOpenDrawer && { visibility: "hidden" })
          }}
        >
          <MenuIcon/>
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
