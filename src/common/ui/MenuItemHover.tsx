import { ReactNode } from "react"
import { Box } from "@mui/material"

const MenuItemHover = ({ children }: { children: ReactNode }) => {
  return (
    <Box  className="hover-highlight" sx={{ width: "100%" }}>
      {children}
    </Box>
  )
}

export default MenuItemHover
