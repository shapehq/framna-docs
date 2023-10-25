import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Stack } from "@mui/material"
import { styled } from "@mui/material/styles"

interface WrapperStackProps {
  drawerWidth: number
  isDrawerOpen: boolean
}

const WrapperStack = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "isDrawerOpen"
})<WrapperStackProps>(({ theme, drawerWidth, isDrawerOpen }) => ({
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

export default function SecondaryWrapper({
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
    <WrapperStack
      direction="column"
      spacing={0}
      drawerWidth={drawerWidth}
      isDrawerOpen={isDrawerOpen}
      sx={{ ...sx, width: "100%", overflowY: "auto" }}
    >
      {children}
    </WrapperStack>
  )
}
