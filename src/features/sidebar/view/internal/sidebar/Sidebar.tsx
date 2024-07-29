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
    <AnimatedDivider isVisible={!isScrolledToTop} />
    <Box sx={{ overflow: "auto", flex: 1 }} ref={projectListRef}>
      <ProjectList/>
    </Box>
    <AnimatedDivider isVisible={!isScrolledToBottom} />
    <UserButton>
      <SettingsList/>
    </UserButton>
  </>
}

const AnimatedDivider = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <Divider
      sx={{
        opacity: isVisible ? 1 : 0,
        marginLeft: 1,
        marginRight: 1.5
      }}
    />
  )
}

export default Sidebar
