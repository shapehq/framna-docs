import { ReactNode } from "react"
import { Box } from "@mui/material"

const MenuItemHover = ({
  disabled,
  children
}: {
  disabled?: boolean
  children: ReactNode
}) => {
  const classNames = ["hover-highlight"]
  if (disabled) {
    classNames.push("hover-highlight-disabled")
  }
  return (
    <Box className={classNames.join(" ")} sx={{ width: "100%" }}>
      {children}
    </Box>
  )
}

export default MenuItemHover
