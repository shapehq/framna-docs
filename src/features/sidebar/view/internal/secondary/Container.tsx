import { SxProps } from "@mui/system"
import { Box, Stack } from "@mui/material"
import { styled } from "@mui/material/styles"
import CustomTopLoader from "@/common/ui/CustomTopLoader"

const SecondaryContainer = ({
  sidebarWidth,
  offsetContent,
  diffWidth,
  offsetDiffContent,
  children,
  isSM,
  disableTransition,
}: {
  sidebarWidth: number
  offsetContent: boolean
  diffWidth?: number
  offsetDiffContent?: boolean
  children?: React.ReactNode,
  isSM: boolean,
  disableTransition?: boolean,
}) => {
  const sx = { overflow: "hidden" }
  return (
    <>
      <InnerSecondaryContainer
    
        sidebarWidth={isSM ? sidebarWidth : 0}
        isSidebarOpen={isSM ? offsetContent : false}
        diffWidth={isSM ? (diffWidth || 0) : 0}
        isDiffOpen={isSM ? (offsetDiffContent || false) : false}
        disableTransition={disableTransition}
        sx={{ ...sx }}
      >
        {children}
      </InnerSecondaryContainer
    >
    </>
  )
}

export default SecondaryContainer

interface WrapperStackProps {
  readonly sidebarWidth: number
  readonly isSidebarOpen: boolean
  readonly diffWidth: number
  readonly isDiffOpen: boolean
  readonly disableTransition?: boolean
}

const WrapperStack = styled(Stack, {
  shouldForwardProp: (prop) =>
    prop !== "isSidebarOpen" &&
    prop !== "sidebarWidth" &&
    prop !== "diffWidth" &&
    prop !== "isDiffOpen" &&
    prop !== "disableTransition"
})<WrapperStackProps>(({ theme, sidebarWidth, isSidebarOpen, diffWidth, isDiffOpen, disableTransition }) => {
  const marginStyles = {
    marginLeft: isSidebarOpen ? 0 : `-${sidebarWidth}px`,
    marginRight: isDiffOpen ? 0 : `-${diffWidth}px`,
  }

  if (disableTransition) {
    return {
      transition: "none",
      ...marginStyles
    }
  }

  return {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    ...marginStyles,
    ...((isSidebarOpen || isDiffOpen) && {
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  };
})

const InnerSecondaryContainer = ({
  sidebarWidth,
  isSidebarOpen,
  diffWidth,
  isDiffOpen,
  disableTransition,
  children,
  sx
}: {
  sidebarWidth: number
  isSidebarOpen: boolean
  diffWidth: number
  isDiffOpen: boolean
  disableTransition?: boolean
  children: React.ReactNode
  sx?: SxProps
}) => {
  return (
    <WrapperStack
      direction="column"
      spacing={0}
      sidebarWidth={sidebarWidth}
      isSidebarOpen={isSidebarOpen}
      diffWidth={diffWidth}
      isDiffOpen={isDiffOpen}
      disableTransition={disableTransition}
      sx={{ ...sx, width: "100%", overflowY: "auto" }}
      
    >
      <RaisedMainContent>
        {children}
      </RaisedMainContent>
    </WrapperStack>
  )
}

const RaisedMainContent = ({ children }: { children?: React.ReactNode }) => {
  return (
    <main style={{ flexGrow: "1" }}>
      <Box sx={{
        height: "100%",
        paddingTop: { xs: 0, sm: 2 },
        marginLeft: { xs: 0, sm: 2 },
        marginRight: { xs: 0, sm: 2 }
      }}>
        <Box id="border-content" sx={{
          height: "100%",
          background: "white",
          boxShadow: { xs: 0, sm: "0 4px 8px rgba(0, 0, 0, 0.08)" },
          borderTopLeftRadius: { xs: 0, sm: "18px" },
          borderTopRightRadius: { xs: 0, sm: "18px" }
        }}>
          <CustomTopLoader parentSelector="#border-content" color="#e0e0e0" />
          {children}
        </Box>
      </Box>
    </main>
  )
}
