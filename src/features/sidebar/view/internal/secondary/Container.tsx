"use client"

import { useState, useEffect } from "react"
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
}: {
  sidebarWidth: number
  offsetContent: boolean
  diffWidth?: number
  offsetDiffContent?: boolean
  children?: React.ReactNode,
  isSM: boolean,
}) => {
  // Disable transitions on initial render to prevent layout shift
  const [enableTransitions, setEnableTransitions] = useState(false)
  useEffect(() => {
    // Enable transitions after first paint
    const rafId = requestAnimationFrame(() => setEnableTransitions(true))
    return () => cancelAnimationFrame(rafId)
  }, [])

  const sx = { overflow: "hidden" }
  return (
    <>
      <InnerSecondaryContainer
        sidebarWidth={isSM ? sidebarWidth : 0}
        isSidebarOpen={isSM ? offsetContent:  false}
        diffWidth={isSM ? (diffWidth || 0) : 0}
        isDiffOpen={isSM ? (offsetDiffContent || false) : false}
        enableTransitions={enableTransitions}
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
  readonly enableTransitions: boolean
}

const WrapperStack = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "isSidebarOpen" && prop !== "sidebarWidth" && prop !== "diffWidth" && prop !== "isDiffOpen" && prop !== "enableTransitions"
})<WrapperStackProps>(({ theme, sidebarWidth, isSidebarOpen, diffWidth, isDiffOpen, enableTransitions }) => {
  return {
    transition: enableTransitions ? theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }) : "none",
    marginLeft: isSidebarOpen ? 0 : `-${sidebarWidth}px`,
    marginRight: isDiffOpen ? 0 : `-${diffWidth}px`,
    ...((isSidebarOpen || isDiffOpen) && enableTransitions && {
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
  enableTransitions,
  children,
  sx
}: {
  sidebarWidth: number
  isSidebarOpen: boolean
  diffWidth: number
  isDiffOpen: boolean
  enableTransitions: boolean
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
      enableTransitions={enableTransitions}
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
