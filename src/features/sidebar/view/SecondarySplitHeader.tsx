"use client"

import { useState, useEffect, useContext } from "react"
import { useSessionStorage } from "usehooks-ts"
import { Box, IconButton, Stack, Tooltip, Collapse, Divider } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faChevronLeft, faChevronRight, faArrowRightArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { isMac as checkIsMac, SidebarTogglableContext } from "@/common"
import { useSidebarOpen } from "@/features/sidebar/data"
import useDiffbarOpen from "@/features/sidebar/data/useDiffbarOpen"
import ToggleMobileToolbarButton from "./internal/secondary/ToggleMobileToolbarButton"
import { useProjectSelection } from "@/features/projects/data"

const isDiffFeatureEnabled = process.env.NEXT_PUBLIC_ENABLE_DIFF_SIDEBAR === "true"

const SecondarySplitHeader = ({
  mobileToolbar,
  children
}: {
  mobileToolbar?: React.ReactNode
  children?: React.ReactNode
}) => {
  const [isSidebarOpen, , , , , setSidebarOpenWithTransition] = useSidebarOpen()
  const [isDiffbarOpen, , , , , setDiffbarOpenWithTransition] = useDiffbarOpen()
  const [isMobileToolbarVisible, setMobileToolbarVisible] = useSessionStorage("isMobileToolbarVisible", true)
  const { specification } = useProjectSelection()
  return (
    <Box>
      <Box sx={{ 
        display: "flex",
        alignItems: "center",
        paddingLeft: 2,
        paddingRight: 2,
        height: 64,
        margin: "auto"
      }}>
        <ToggleSidebarButton
          isSidebarOpen={isSidebarOpen}
          onClick={setSidebarOpenWithTransition}
        />
        <Box sx={{ position: "relative", flexGrow: 1, overflow: "hidden", minWidth: 0, height: 40 }}>
          <Stack direction="row" alignItems="center" sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", whiteSpace: "nowrap" }}>
            {children}
            <Divider orientation="vertical" flexItem sx={{ marginLeft: 0.5, marginRight: 0.5 }} />
            {mobileToolbar && (
              <ToggleMobileToolbarButton
                direction={isMobileToolbarVisible ? "up" : "down"}
                onToggle={() => setMobileToolbarVisible(!isMobileToolbarVisible) }
              />
            )}
          </Stack>
        </Box>
        {isDiffFeatureEnabled && (
          <ToggleDiffButton
            isDiffbarOpen={isDiffbarOpen}
            onClick={setDiffbarOpenWithTransition}
            isDiffAvailable={!!specification?.diffURL}
          />
        )}
      </Box>
      {mobileToolbar && (
        <Collapse in={isMobileToolbarVisible}>
          <Box sx={{
            padding: 2,
            paddingTop: 0,
            display: { sm: "block", md: "none" }
          }}>
            {mobileToolbar}
          </Box>
        </Collapse>
      )}
    </Box>
  )
}

export default SecondarySplitHeader

const ToggleSidebarButton = ({
  isSidebarOpen,
  onClick
}: {
  isSidebarOpen: boolean,
  onClick: (isSidebarOpen: boolean) => void
}) => {
  const [isMac, setIsMac] = useState(false)
  useEffect(() => {
    // checkIsMac uses window so we delay the check.
    const timeout = window.setTimeout(() => {
      setIsMac(checkIsMac())
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [setIsMac])
  const isSidebarTogglable = useContext(SidebarTogglableContext)
  const openCloseKeyboardShortcut = `(${isMac ? "⌘" : "^"} + .)`
  const tooltip = isSidebarOpen ? "Hide Projects" : "Show Projects" 
  return (
    <Box sx={{ display: isSidebarTogglable ? "block" : "none" }}>
    <Tooltip title={`${tooltip} ${openCloseKeyboardShortcut}`}>
      <IconButton
        size="medium"
        color="primary"
        onClick={() => onClick(!isSidebarOpen)}
        edge="start"
      >
        <FontAwesomeIcon
          icon={isSidebarOpen ? faChevronLeft : faBars}
          size="sm"
          style={{ aspectRatio: 1, padding: 2 }}
        />
      </IconButton>
    </Tooltip>
    </Box>
  )
}

const ToggleDiffButton = ({
  isDiffbarOpen,
  onClick,
  isDiffAvailable
}: {
  isDiffbarOpen: boolean,
  onClick: (isDiffbarOpen: boolean) => void,
  isDiffAvailable: boolean
}) => {
  const [isMac, setIsMac] = useState(false)
  useEffect(() => {
    // checkIsMac uses window so we delay the check.
    const timeout = window.setTimeout(() => {
      setIsMac(checkIsMac())
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [])
  const isSidebarTogglable = useContext(SidebarTogglableContext)
  const openCloseKeyboardShortcut = `(${isMac ? "⌘" : "^"} + K)`
  const isDisabled = !isDiffAvailable && !isDiffbarOpen
  const tooltip = isDisabled
    ? "Changes cannot be displayed"
    : isDiffbarOpen
    ? "Hide changes"
    : "Show changes"
  return (
    <Box sx={{ display: isSidebarTogglable ? "block" : "none" }}>

      <Tooltip title={isDisabled ? tooltip : `${tooltip} ${openCloseKeyboardShortcut}`}>
        <span>
          <IconButton
            size="medium"
            color="primary"
            onClick={() => onClick(!isDiffbarOpen)}
            edge="end"
            disabled={isDisabled}
          >
            <FontAwesomeIcon
              icon={isDiffbarOpen ? faChevronRight : faArrowRightArrowLeft}
              size="xs"
              style={{ aspectRatio: 1, padding: 2 }}
            />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}
