"use client"

import { useRef, useEffect, useState } from "react"
import { Box, Divider } from "@mui/material"
import Header from "./Header"
import UserButton from "./user/UserButton"
import SettingsList from "./settings/SettingsList"
  
const Sidebar = ({ children }: { children?: React.ReactNode }) => {
  const [isScrolledToTop, setScrolledToTop] = useState(true)
  const [isScrolledToBottom, setScrolledToBottom] = useState(true)
  const scrollableAreaRef = useRef<HTMLDivElement | null>(null)
  const handleScroll = () => {
    const element = scrollableAreaRef.current
    if (!element) {
      return
    }
    setScrolledToTop(element.scrollTop < 10)
    setScrolledToBottom(element.scrollHeight - element.scrollTop - element.clientHeight < 10)
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
  return <>
    <Header/>
    <Divider sx={{ opacity: isScrolledToTop ? 0 : 1 }} />
    <Box sx={{ overflow: "auto", flex: 1 }} ref={scrollableAreaRef}>
      {children}
    </Box>
    <Divider sx={{ opacity: isScrolledToBottom ? 0 : 1 }} />
    <UserButton>
      <SettingsList/>
    </UserButton>
  </>
}

export default Sidebar
