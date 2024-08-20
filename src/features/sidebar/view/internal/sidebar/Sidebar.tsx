import { Box } from "@mui/material"
import Header from "./Header"
import UserButton from "./user/UserButton"
import SettingsList from "./settings/SettingsList"
import NewProjectButton from "./NewProjectButton"
import SidebarDivider from "./SidebarDivider"

const Sidebar = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      <Header/>
      <SidebarDivider/>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          marginRight: "5px",
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.1)"
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.25)"
          }
        }}
      >
        {children}
        <NewProjectButton/>
      </Box>
      <SidebarDivider/>
      <UserButton>
        <SettingsList/>
      </UserButton>
    </>
  )
}

export default Sidebar
