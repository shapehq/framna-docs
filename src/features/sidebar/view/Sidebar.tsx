import { Box } from "@mui/material"
import Header from "./internal/sidebar-content/Header"
import UserButton from "./internal/sidebar-content/user/UserButton"
import SettingsList from "./internal/sidebar-content/settings/SettingsList"
import ProjectList from "./internal/sidebar-content/projects/ProjectList"

const Sidebar = () => {
  return <>
    <Header/>
    <Box sx={{ overflow: "auto", flex: 1 }}>
      <ProjectList/>
    </Box>
    <UserButton>
      <SettingsList/>
    </UserButton>
  </>
}

export default Sidebar
