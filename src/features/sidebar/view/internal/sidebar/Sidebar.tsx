import { Box } from "@mui/material"
import Header from "./Header"
import UserButton from "./user/UserButton"
import SettingsList from "./settings/SettingsList"
import NewProjectButton from "./NewProjectButton"
import SidebarScrollableArea from "./SidebarScrollableArea"

const Sidebar = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      <Header />
      <Box sx={{ overflow: "hidden" }}>
        <SidebarScrollableArea>
          <NewProjectButton/>
          {children}
        </SidebarScrollableArea>
      </Box>
      <UserButton>
        <SettingsList />
      </UserButton>
    </>
  )
}

export default Sidebar
