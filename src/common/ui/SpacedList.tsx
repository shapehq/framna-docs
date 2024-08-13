import React from "react"
import { List, Box } from "@mui/material"

const SpacedList = ({
  children,
  itemSpacing
}: {
  children: React.ReactNode
  itemSpacing: number
}) => {
  return (
    <List disablePadding sx={{ margin: 0 }}>
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
