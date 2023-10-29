import { ReactNode } from "react"
import { Box } from "@mui/material"

const MenuItemHover = ({ children }: { children: ReactNode }) => {
  return (
    <Box 
      className="hover-highlight"
      sx={{
        width: "100%",
        paddingLeft: 1.25,
        paddingRight: 1.25,
        paddingTop: 1,
        paddingBottom: 1,
        borderRadius: "12px"
      }}
    >
      {children}
    </Box>
  )
}

export default MenuItemHover
