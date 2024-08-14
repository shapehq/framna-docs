"use client"

import { SxProps } from "@mui/system"
import { Box } from "@mui/material"
import useMediaQuery from "@mui/material/useMediaQuery"

const MenuItemHover = ({
  disabled,
  children,
  sx
}: {
  disabled?: boolean
  children: React.ReactNode
  sx?: SxProps
}) => {
  const isHoverSupported = useMediaQuery("(hover: hover)")
  const classNames = ["menu-item-highlight"]
  if (isHoverSupported) {
    classNames.push("hover-highlight")
    if (disabled) {
      classNames.push("hover-highlight-disabled")
    }
  } else {
    classNames.push("active-highlight")
    if (disabled) {
      classNames.push("active-highlight-disabled")
    }
  }
  return (
    <Box className={classNames.join(" ")} sx={{ ...sx, width: "100%" }}>
      {children}
    </Box>
  )
}

export default MenuItemHover
