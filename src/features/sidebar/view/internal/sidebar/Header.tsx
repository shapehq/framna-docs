"use client"

import { useContext, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Box, Button, CircularProgress, Tooltip, Typography } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation"
import * as NProgress from "nprogress"
import { ProjectsContext } from "@/common"
import { useCloseSidebarOnSelection } from "@/features/sidebar/data"

const Header = ({ siteName }: { siteName?: string }) => {
  const router = useRouter()
  const { closeSidebarIfNeeded } = useCloseSidebarOnSelection()
  const { refreshing } = useContext(ProjectsContext)
  const [showCheck, setShowCheck] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const wasRefreshing = useRef(false)

  useEffect(() => {
    if (wasRefreshing.current && !refreshing) {
      // Delay checkmark appearance to let spinner fade out first
      const showTimeout = setTimeout(() => {
        setShowCheck(true)
        setFadeOut(false)
      }, 400)
      const fadeTimeout = setTimeout(() => setFadeOut(true), 1600)
      const hideTimeout = setTimeout(() => setShowCheck(false), 2200)
      return () => {
        clearTimeout(showTimeout)
        clearTimeout(fadeTimeout)
        clearTimeout(hideTimeout)
      }
    }
    wasRefreshing.current = refreshing
  }, [refreshing])
  return (
    <Box sx={{
      marginTop: 1.5,
      marginBottom: 0.5,
      paddingLeft: 2.1,
      minHeight: 64,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <Button
        sx={{
          display: "flex",
          padding: 0,
          gap: "6px",
          "&:hover": {
            backgroundColor: "transparent"
          }
        }}
        onClick={() => {
          closeSidebarIfNeeded()
          NProgress.start()
          router.push("/")
        }}
      >
        <Image
          src="/images/logo.png"
          alt={`${siteName} logo`}
          width={40}
          height={45}
          priority={true}
        />
        <Typography variant="h6">
          {siteName}
        </Typography>
      </Button>
      <Tooltip title={refreshing ? "Refreshing projects and versions..." : ""} disableHoverListener={!refreshing}>
        <Box sx={{
          display: "flex",
          alignItems: "center",
          marginRight: 2,
          width: 16,
          justifyContent: "center",
          position: "relative"
        }}>
          <Box sx={{
            opacity: refreshing ? 1 : 0,
            transition: "opacity 0.4s ease-in-out",
            position: "absolute"
          }}>
            <CircularProgress size={16} sx={{ color: "rgba(0, 0, 0, 0.3)" }} />
          </Box>
          <Box sx={{
            opacity: showCheck && !fadeOut ? 1 : 0,
            transition: "opacity 0.5s ease-out",
            position: "absolute"
          }}>
            <FontAwesomeIcon icon={faCheck} style={{ color: "rgba(0, 0, 0, 0.3)", fontSize: 14 }} />
          </Box>
        </Box>
      </Tooltip>
    </Box>
  )
}

export default Header
