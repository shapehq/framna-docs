import { ReactNode } from "react"
import { Box } from "@mui/material"
import UserListItem from "@/features/user/view/UserListItem"
import SettingsButton from "@/features/settings/view/SettingsButton"

const SidebarContent: React.FC<{
  readonly children: ReactNode
}> = ({
  children
}) => {
  return (
    <>
      {children}
      <Box style={{ padding: 15 }}>
        <UserListItem secondaryItem={<SettingsButton/>} />
      </Box>
    </>
  )
}

export default SidebarContent
