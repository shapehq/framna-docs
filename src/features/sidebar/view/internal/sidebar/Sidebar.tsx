"use client"

import { useRef, useEffect, useState } from "react"
import { Box, SxProps } from "@mui/material"
import Header from "./Header"
import UserButton from "./user/UserButton"
import SettingsList from "./settings/SettingsList"
import NewProjectButton from "./NewProjectButton"

const Sidebar = ({ children }: { children?: React.ReactNode }) => {
  const [isScrolledToTop, setScrolledToTop] = useState(true)
  const [isScrolledToBottom, setScrolledToBottom] = useState(true)
  const scrollableAreaRef = useRef<HTMLDivElement | null>(null)
  const handleScroll = () => {
    const element = scrollableAreaRef.current
    if (!element) {
      return
    }
    const threshold = 10
    setScrolledToTop(element.scrollTop < threshold)
    setScrolledToBottom(element.scrollHeight - element.scrollTop - element.clientHeight < threshold)
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
      <Header />
      <Box sx={{
        position: "relative",
        overflow: "hidden"
      }}>
        <Shadow
          sx={{ 
            position: "absolute",
            top: 0,
            transition: "opacity 0.2s ease",
            opacity: isScrolledToTop ? 0 : 1
          }}
        />
        <Box
          ref={scrollableAreaRef}
          sx={{
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.1)"
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.25)"
            }
          }}
        >
          <NewProjectButton/>
          {children}
        </Box>
        <Shadow
          sx={{ 
            position: "absolute", 
            bottom: 0, 
            transform: "rotateX(180deg)",
            transition: "opacity 0.2s ease",
            opacity: isScrolledToBottom ? 0 : 1
          }}
        />
      </Box>
      <UserButton>
        <SettingsList />
      </UserButton>
    </>
  )
}

export default Sidebar

const Shadow = ({ sx }: { sx?: SxProps }) => {
  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        overflow: "hidden",
        maskImage: "linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0) 100%)",
        WebkitMaskImage: "linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0) 100%)",
        ...sx
      }}
    >
      <Box
        sx={{
          height: "0.5px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          width: "100%"
        }}
      />
      <Box
        sx={{
          height: "0.5px",
          backgroundColor: "rgba(0, 0, 0, 0.04)",
          width: "100%"
        }}
      />
      <Box
        sx={{
          height: "9px",
          background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0))",
          width: "100%"
        }}
      />
    </Box>
  )
}
