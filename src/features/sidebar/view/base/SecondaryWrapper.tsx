import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Stack } from "@mui/material"
import { styled } from "@mui/material/styles"

interface WrapperStackProps {
  sidebarWidth: number
  isSidebarOpen: boolean
}

const WrapperStack = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "isSidebarOpen"
})<WrapperStackProps>(({ theme, sidebarWidth, isSidebarOpen }) => ({
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  marginLeft: `-${sidebarWidth}px`,
  ...(isSidebarOpen && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0
  })
}))

export default function SecondaryWrapper({
  sidebarWidth,
  isSidebarOpen,
  children,
  sx
}: {
  sidebarWidth: number
  isSidebarOpen: boolean
  children: ReactNode
  sx?: SxProps
}) {
  return (
    <WrapperStack
      direction="column"
      spacing={0}
      sidebarWidth={sidebarWidth}
      isSidebarOpen={isSidebarOpen}
      sx={{ ...sx, width: "100%", overflowY: "auto" }}
    >
      {children}
    </WrapperStack>
  )
}
