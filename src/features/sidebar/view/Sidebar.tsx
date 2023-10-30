import { ReactNode } from "react"
import { Box } from "@mui/material"
import SidebarHeader from "./SidebarHeader"
import UserFooter from "@/features/user/view/UserFooter"

const Sidebar = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <SidebarHeader/>
      <Box sx={{ overflow: "auto", flex: 1 }}>
        {children}
      </Box>
      <UserFooter/>
    </>
  )
}

export default Sidebar
