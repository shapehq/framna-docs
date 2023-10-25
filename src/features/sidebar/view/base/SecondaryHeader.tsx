import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Divider, IconButton, Toolbar } from "@mui/material"
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import { styled, useTheme } from "@mui/material/styles"
import MenuIcon from "@mui/icons-material/Menu"

interface AppBarProps extends MuiAppBarProps {
  drawerWidth: number
  isDrawerOpen?: boolean
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "isDrawerOpen"
})<AppBarProps>(({ theme, drawerWidth, isDrawerOpen }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(isDrawerOpen && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}))

export default function SecondaryHeader({
  drawerWidth,
  isDrawerOpen,
  onOpen,
  children,
  sx
}: {
  drawerWidth: number
  isDrawerOpen: boolean
  onOpen: () => void
  children: ReactNode,
  sx?: SxProps
}) {
  const theme = useTheme()
  return (
    <AppBar
      position="fixed"
      drawerWidth={drawerWidth}
      isDrawerOpen={isDrawerOpen}
      elevation={0}
      sx={{ ...sx, backgroundColor: theme.palette.background.default }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          onClick={onOpen}
          edge="start"
          sx={{
            mr: 2,
            color: theme.palette.text.primary,
            ...(isDrawerOpen && { display: "none" })
          }}
        >
          <MenuIcon/>
        </IconButton>
        {children}
      </Toolbar>
      <Divider />
    </AppBar>
  )
}
