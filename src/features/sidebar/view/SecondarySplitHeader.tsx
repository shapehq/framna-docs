"use client"

import { useState, useEffect } from "react"
import { useSessionStorage } from "usehooks-ts"
import { Box, IconButton, Stack, Tooltip, Divider, Collapse } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import { isMac as checkIsMac } from "@/common"
import { useSidebarOpen } from "@/features/sidebar/data"
import ToggleMobileToolbarButton from "./internal/secondary/ToggleMobileToolbarButton"

const Header = ({
  mobileToolbar,
  children,
  showDivider=true,
}: {
  mobileToolbar?: React.ReactNode
  children?: React.ReactNode,
  showDivider?: boolean,
}) => {
  const [isSidebarOpen, setSidebarOpen] = useSidebarOpen()
  const [isMac, setIsMac] = useState(false)
  const [isMobileToolbarVisible, setMobileToolbarVisible] = useSessionStorage("isMobileToolbarVisible", true)
  useEffect(() => {
    // checkIsMac uses window so we delay the check.
    setIsMac(checkIsMac())
  }, [isMac, setIsMac])
  const openCloseKeyboardShortcut = `(${isMac ? "⌘" : "^"} + .)`
  return (
    <Box>
      <Box sx={{ 
        display: "flex",
        alignItems: "center",
        paddingLeft: 2,
        paddingRight: 2,
        maxWidth: "1460px",
        height: 64,
        margin: "auto"
      }}>
        {!isSidebarOpen &&
          <Tooltip title={`Show Projects ${openCloseKeyboardShortcut}`}>
            <IconButton
              size="medium"
              color="primary"
              onClick={() => setSidebarOpen(true)}
              edge="start"
            >
              <FontAwesomeIcon
                icon={faBars}
                size="sm"
                style={{ aspectRatio: 1, padding: 2 }}
              />
            </IconButton>
          </Tooltip>
        }
        {isSidebarOpen &&
          <Tooltip title={`Hide Projects ${openCloseKeyboardShortcut}`}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => setSidebarOpen(false)}
              edge="start"
            >
            <FontAwesomeIcon
              icon={faChevronLeft}
              size="sm"
              style={{ aspectRatio: 1, padding: 2 }}
            />
          </IconButton>
          </Tooltip>
        }
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
      {showDivider && <Divider />}
    </Box>
  )
}

export default Header