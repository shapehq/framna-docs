import React from "react"
import { List, Box, SxProps } from "@mui/material"

const SpacedList = ({
  itemSpacing,
  sx,
  children
}: {
  itemSpacing: number
  sx?: SxProps
  children?: React.ReactNode
}) => {
  return (
    <List disablePadding sx={{ ...sx }}>
      {React.Children.map(children, (child, idx) => (
        <Box sx={{
          marginBottom: idx < React.Children.count(children) - 1 ? itemSpacing : 0
        }}>
          {child}
        </Box>
      ))}
    </List>
  )
}

export default SpacedList
