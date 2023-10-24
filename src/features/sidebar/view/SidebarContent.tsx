import { ReactNode } from "react"
import { Box } from "@mui/material"
import UserListItem from "@/features/user/view/UserListItem"
import SettingsButton from "@/features/settings/view/SettingsButton"

const SidebarContent = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Box sx={{ overflow: "auto", flex: 1 }}>
        {children}
      </Box>
      <UserListItem secondaryItem={<SettingsButton/>} />
    </>
  )
}

export default SidebarContent
