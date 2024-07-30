import { useRef, useEffect, useState } from "react"
import { Box, Divider } from "@mui/material"
import Header from "./Header"
import UserButton from "./user/UserButton"
import SettingsList from "./settings/SettingsList"
import ProjectList from "./projects/ProjectList"

const Sidebar = () => {
  const [isScrolledToTop, setScrolledToTop] = useState(true)
  const [isScrolledToBottom, setScrolledToBottom] = useState(true)
  const projectListRef = useRef<HTMLDivElement | null>(null)
  const handleScroll = () => {
    const element = projectListRef.current
    if (!element) {
      return
    }
    setScrolledToTop(element.scrollTop < 10)
    setScrolledToBottom(element.scrollHeight - element.scrollTop - element.clientHeight < 10)
  }
  useEffect(() => {
    const element = projectListRef.current
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
    <Box sx={{ overflow: "auto", flex: 1 }} ref={projectListRef}>
      <ProjectList/>
    </Box>
    <Divider sx={{ opacity: isScrolledToBottom ? 0 : 1 }} />
    <UserButton>
      <SettingsList/>
    </UserButton>
  </>
}

export default Sidebar
