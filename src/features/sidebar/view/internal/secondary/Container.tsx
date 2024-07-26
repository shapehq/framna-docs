import { SxProps } from "@mui/system"
import { Stack } from "@mui/material"
import { styled } from "@mui/material/styles"

const SecondaryContainer = ({
  sidebarWidth,
  offsetContent,
  children
}: {
  sidebarWidth: number
  offsetContent: boolean
  children?: React.ReactNode
}) => {
  const sx = { overflow: "hidden" }
  return (
    <>
      <_SecondaryContainer
        sidebarWidth={0}
        isSidebarOpen={false}
        sx={{ ...sx, display: { xs: "flex", sm: "none" } }}
      >
        {children}
      </_SecondaryContainer>
      <_SecondaryContainer
        sidebarWidth={sidebarWidth}
        isSidebarOpen={offsetContent}
        sx={{ ...sx, display: { xs: "none", sm: "flex" } }}
      >
        {children}
      </_SecondaryContainer>
    </>
  )
}

export default SecondaryContainer

interface WrapperStackProps {
  readonly sidebarWidth: number
  readonly isSidebarOpen: boolean
}

const WrapperStack = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "isSidebarOpen" && prop !== "sidebarWidth"
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

const _SecondaryContainer = ({
  sidebarWidth,
  isSidebarOpen,
  children,
  sx
}: {
  sidebarWidth: number
  isSidebarOpen: boolean
  children: React.ReactNode
  sx?: SxProps
}) => {
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
