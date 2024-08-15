"use client"

import { Box, Divider } from "@mui/material"
import Header from "./Header"
import UserButton from "./user/UserButton"
import SettingsList from "./settings/SettingsList"
import NewProjectButton from "./NewProjectButton"

const Sidebar = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      <Header/>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          background: "white",
          marginLeft: 2,
          marginRight: 1,
          borderRadius: "18px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)",
          overflow: "hidden"
        }}
      >
        <NewProjectButton/>
        <Divider sx={{ marginLeft: 1, marginRight: 1 }} />
        <Box 
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar-track": {
              marginBottom: "10px"
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.1)"
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.25)"
            }
          }}
        >
          {children}
        </Box>
      </Box>
      <UserButton>
        <SettingsList/>
      </UserButton>
    </>
  )
}

export default Sidebar
