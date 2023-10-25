import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Box, Toolbar } from "@mui/material"
import { styled } from "@mui/material/styles"

interface MainProps {
  drawerWidth: number
  isDrawerOpen: boolean
}

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "isDrawerOpen"
})<MainProps>(({ theme, drawerWidth, isDrawerOpen }) => ({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  overflowY: "auto",
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(isDrawerOpen && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0
  })
}))

export default function SecondaryContent({
  drawerWidth,
  isDrawerOpen,
  children,
  sx
}: {
  drawerWidth: number
  isDrawerOpen: boolean
  children: ReactNode
  sx?: SxProps
}) {
  return (
    <Main drawerWidth={drawerWidth} isDrawerOpen={isDrawerOpen} sx={sx}>
      <Toolbar/>
      <Box sx={{ overflowY: "scroll" }}>
        {children}
      </Box>
    </Main>
  )
}
