"use client"

import { useEffect, useContext } from "react"
import { Stack, useMediaQuery, useTheme } from "@mui/material"
import { isMac, useKeyboardShortcut, SidebarTogglableContext } from "@/common"
import { useSidebarOpen } from "../../data"
import useDiffbarOpen from "../../data/useDiffbarOpen"
import { useProjectSelection } from "@/features/projects/data"
import PrimaryContainer from "./primary/Container"
import SecondaryContainer from "./secondary/Container"
import RightContainer from "./tertiary/RightContainer"

const isDiffFeatureEnabled = process.env.NEXT_PUBLIC_ENABLE_DIFF_SIDEBAR === "true"

const ClientSplitView = ({
  sidebar,
  children,
  sidebarRight
}: {
  sidebar: React.ReactNode
  children?: React.ReactNode
  sidebarRight?: React.ReactNode
}) => {
  const theme = useTheme()
  const sidebarTransitionDuration = Math.max(
    theme.transitions.duration.enteringScreen,
    theme.transitions.duration.leavingScreen
  )
  const diffbarTransitionDuration = sidebarTransitionDuration
  const sidebarState = useSidebarOpen({ clearAnimationAfterMs: sidebarTransitionDuration })
  const diffbarState = useDiffbarOpen({ clearAnimationAfterMs: diffbarTransitionDuration })
  const { specification } = useProjectSelection()
  const isSidebarTogglable = useContext(SidebarTogglableContext)
  const isSM = useMediaQuery(theme.breakpoints.up("sm"))
  const isLayoutReady = sidebarState.isInitialized && diffbarState.isInitialized

  useEffect(() => {
    if (!isSidebarTogglable && !sidebarState.isOpen) {
      sidebarState.setOpen(true)
    }
  }, [sidebarState.isOpen, isSidebarTogglable, sidebarState.setOpen])
  

  // Close diff sidebar if no specification is selected
  useEffect(() => {
    if (!specification && diffbarState.isOpen) {
      diffbarState.setOpen(false)
    }
  }, [diffbarState.isOpen, diffbarState.setOpen, specification])

  useKeyboardShortcut(event => {
    const isActionKey = isMac() ? event.metaKey : event.ctrlKey
    if (isActionKey && event.key === ".") {
      event.preventDefault()
      if (isSidebarTogglable) {
        sidebarState.setOpenWithTransition(!sidebarState.isOpen)
      }
    }
  }, [sidebarState.isOpen, isSidebarTogglable, sidebarState.setOpenWithTransition])
  
  useKeyboardShortcut(event => {
    const isActionKey = isMac() ? event.metaKey : event.ctrlKey
    if (isDiffFeatureEnabled && isActionKey && event.key === "k") {
      event.preventDefault()
      diffbarState.setOpenWithTransition(!diffbarState.isOpen)
    }
  }, [diffbarState.isOpen, diffbarState.setOpenWithTransition])
  
  const sidebarWidth = 320
  const diffWidth = 320

  return (
    <Stack
      direction="row"
      spacing={0}
      sx={{ width: "100%", height: "100%", visibility: isLayoutReady ? "visible" : "hidden" }}
    >
      <PrimaryContainer
        width={sidebarWidth}
        isOpen={sidebarState.isOpen}
        onClose={() => sidebarState.setOpenWithTransition(false)}
        disableTransition={!sidebarState.shouldAnimate}
      >
        {sidebar}
      </PrimaryContainer>
      <SecondaryContainer
        isSM={isSM}
        sidebarWidth={sidebarWidth}
        offsetContent={sidebarState.isOpen}
        diffWidth={diffWidth}
        offsetDiffContent={diffbarState.isOpen}
        disableTransition={!sidebarState.shouldAnimate && !diffbarState.shouldAnimate}
      >
        {children}
      </SecondaryContainer>
      <RightContainer
        width={diffWidth}
        isOpen={diffbarState.isOpen}
        onClose={() => diffbarState.setOpenWithTransition(false)}
        disableTransition={!diffbarState.shouldAnimate}
      >
        {sidebarRight}
      </RightContainer>
    </Stack>
  )
}

export default ClientSplitView
