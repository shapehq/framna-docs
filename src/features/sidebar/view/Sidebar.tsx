import { ReactNode } from "react"
import { Box } from "@mui/material"
import UserFooter from "@/features/user/view/UserFooter"

const Sidebar = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Box sx={{ overflow: "auto", flex: 1 }}>
        {children}
      </Box>
      <UserFooter/>
    </>
  )
}

export default Sidebar
