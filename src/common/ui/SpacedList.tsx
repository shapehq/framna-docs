import React from "react"
import { List, Box, SxProps } from "@mui/material"

interface SpacedListProps {
  itemSpacing: number
  sx?: SxProps
  children?: React.ReactNode
}

const SpacedList = ({ itemSpacing, sx, children }: SpacedListProps) => {
  const childrenArray = React.Children.toArray(children)
  const lastIndex = childrenArray.length - 1

  return (
    <List disablePadding sx={sx}>
      {childrenArray.map((child, idx) => (
        <Box
          key={idx}
          sx={{
            marginBottom: idx < lastIndex ? itemSpacing : 0
          }}
        >
          {child}
        </Box>
      ))}
    </List>
  )
}

export default SpacedList
