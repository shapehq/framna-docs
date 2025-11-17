"use client"

import { useState, useEffect, useContext } from "react"
import { useSessionStorage } from "usehooks-ts"
import { Box, IconButton, Stack, Tooltip, Collapse } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import { isMac as checkIsMac, SidebarTogglableContext } from "@/common"
import { useSidebarOpen } from "@/features/sidebar/data"
import ToggleMobileToolbarButton from "./internal/secondary/ToggleMobileToolbarButton"

const SecondarySplitHeader = ({
  mobileToolbar,
  children
}: {
  mobileToolbar?: React.ReactNode
  children?: React.ReactNode
}) => {
  const [isSidebarOpen, setSidebarOpen] = useSidebarOpen()
  const [isMobileToolbarVisible, setMobileToolbarVisible] = useSessionStorage("isMobileToolbarVisible", true)
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
          onClick={setSidebarOpen}
        />
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "end" }}> 
          <Stack direction="row" alignItems="center">
            {children}
            {mobileToolbar &&
              <ToggleMobileToolbarButton
                direction={isMobileToolbarVisible ? "up" : "down"}
                onToggle={() => setMobileToolbarVisible(!isMobileToolbarVisible) }
              />
            }
          </Stack>
        </Box>
      </Box>
      {mobileToolbar &&
        <Collapse in={isMobileToolbarVisible}>
          <Box sx={{
            padding: 2,
            paddingTop: 0,
            display: { sm: "block", md: "none" }
          }}>
            {mobileToolbar}
          </Box>
        </Collapse>
      }
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
  const tooltip = isSidebarOpen ? "Show Projects" : "Hide Projects" 
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
