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
  const [
    isSidebarOpen,
    setSidebarOpen,
    ,
    isSidebarInitialized,
    shouldAnimateSidebar,
    setSidebarOpenWithTransition,
    setShouldAnimateSidebar
  ] = useSidebarOpen()
  const [
    isRightSidebarOpen,
    setRightSidebarOpen,
    ,
    isDiffbarInitialized,
    shouldAnimateDiffbar,
    setDiffbarOpenWithTransition,
    setShouldAnimateDiffbar
  ] = useDiffbarOpen()
  const { specification } = useProjectSelection()
  const isSidebarTogglable = useContext(SidebarTogglableContext)
  const theme = useTheme()
  // Determine if the screen size is small or larger
  const isSM = useMediaQuery(theme.breakpoints.up("sm"))
  const isLayoutReady = isSidebarInitialized && isDiffbarInitialized
  const sidebarTransitionDuration = Math.max(
    theme.transitions.duration.enteringScreen,
    theme.transitions.duration.leavingScreen
  )
  const diffbarTransitionDuration = sidebarTransitionDuration

  useEffect(() => {
    if (!isSidebarTogglable && !isSidebarOpen) {
      setSidebarOpen(true)
    }
  }, [isSidebarOpen, isSidebarTogglable, setSidebarOpen])
  

  // Close diff sidebar if no specification is selected
  useEffect(() => {
    if (!specification && isRightSidebarOpen) {
      setRightSidebarOpen(false)
    }
  }, [specification, isRightSidebarOpen, setRightSidebarOpen])

  useEffect(() => {
    if (!shouldAnimateSidebar) {
      return
    }

    const timeout = window.setTimeout(() => {
      setShouldAnimateSidebar(false)
    }, sidebarTransitionDuration)

    return () => window.clearTimeout(timeout)
  }, [shouldAnimateSidebar, setShouldAnimateSidebar, sidebarTransitionDuration])

  useEffect(() => {
    if (!shouldAnimateDiffbar) {
      return
    }

    const timeout = window.setTimeout(() => {
      setShouldAnimateDiffbar(false)
    }, diffbarTransitionDuration)

    return () => window.clearTimeout(timeout)
  }, [shouldAnimateDiffbar, setShouldAnimateDiffbar, diffbarTransitionDuration])

  useKeyboardShortcut(event => {
    const isActionKey = isMac() ? event.metaKey : event.ctrlKey
    if (isActionKey && event.key === ".") {
      event.preventDefault()
      if (isSidebarTogglable) {
        setSidebarOpenWithTransition(!isSidebarOpen)
      }
    }
  }, [isSidebarTogglable, setSidebarOpenWithTransition, isSidebarOpen])
  
  useKeyboardShortcut(event => {
    const isActionKey = isMac() ? event.metaKey : event.ctrlKey
    if (isDiffFeatureEnabled && isActionKey && event.key === "k") {
      event.preventDefault()
      setDiffbarOpenWithTransition(!isRightSidebarOpen)
    }
  }, [isRightSidebarOpen, setDiffbarOpenWithTransition])
  
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
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpenWithTransition(false)}
        disableTransition={!shouldAnimateSidebar}
      >
        {sidebar}
      </PrimaryContainer>
      <SecondaryContainer
        isSM={isSM}
        sidebarWidth={sidebarWidth}
        offsetContent={isSidebarOpen}
        diffWidth={diffWidth}
        offsetDiffContent={isRightSidebarOpen}
        disableTransition={!shouldAnimateSidebar && !shouldAnimateDiffbar}
      >
        {children}
      </SecondaryContainer>
      <RightContainer
        width={diffWidth}
        isOpen={isRightSidebarOpen}
        onClose={() => setDiffbarOpenWithTransition(false)}
        disableTransition={!shouldAnimateDiffbar}
      >
        {sidebarRight}
      </RightContainer>
    </Stack>
  )
}

export default ClientSplitView
