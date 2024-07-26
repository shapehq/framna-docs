import { Box } from "@mui/material"
import Header from "./Header"
import UserButton from "./user/UserButton"
import SettingsList from "./settings/SettingsList"
import ProjectList from "./projects/ProjectList"

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
