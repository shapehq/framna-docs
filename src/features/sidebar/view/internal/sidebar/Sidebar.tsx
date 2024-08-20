"use client"

import { useRef, useEffect, useState } from "react"
import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import Header from "./Header"
import UserButton from "./user/UserButton"
import SettingsList from "./settings/SettingsList"
import NewProjectButton from "./NewProjectButton"

const Sidebar = ({ children }: { children?: React.ReactNode }) => {
  const theme = useTheme()
  const [isScrolledToTop, setScrolledToTop] = useState(true)
  const scrollableAreaRef = useRef<HTMLDivElement | null>(null)
  const handleScroll = () => {
    const element = scrollableAreaRef.current
    if (!element) {
      return
    }
    setScrolledToTop(element.scrollTop < 10)
  }
  useEffect(() => {
    const element = scrollableAreaRef.current
    if (element) {
      element.addEventListener("scroll", handleScroll)
      handleScroll()
      return () => {
        element.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])
  return (
    <>
      <Header/>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          marginLeft: { xs: 1, sm: 2 },
          marginRight: 1,
          border: `0.5px solid ${theme.palette.divider}`,
          borderRadius: "18px",
          overflow: "hidden"
        }}
      >
        <NewProjectButton/>
        <Box sx={{
          height: "0.5px",
          marginLeft: 1,
          marginRight: 1,
          background: theme.palette.divider,
          opacity: isScrolledToTop ? 0 : 1
        }} />
        <Box
          ref={scrollableAreaRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar-track": {
              marginBottom: "10px"
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.1)"
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.25)"
            }
          }}
        >
          {children}
        </Box>
      </Box>
      <UserButton>
        <SettingsList/>
      </UserButton>
    </>
  )
}

export default Sidebar
