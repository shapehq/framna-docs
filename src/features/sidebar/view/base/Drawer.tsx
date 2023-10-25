import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Drawer as MuiDrawer } from "@mui/material"
import PrimaryHeader from "./PrimaryHeader"

export default function Drawer({
  variant,
  width,
  isOpen,
  header,
  onClose,
  sx,
  children
}: {
  variant: "persistent" | "temporary",
  width: number
  isOpen: boolean
  header: ReactNode,
  onClose: () => void,
  sx: SxProps,
  children?: ReactNode
}) {
  return (
    <MuiDrawer
      variant={variant}
      anchor="left"
      open={isOpen}
      sx={{ 
       ...sx,
       width: width,
       flexShrink: 0,
       "& .MuiDrawer-paper": {
         width: width,
         boxSizing: "border-box"
       }
     }}
    >
      <PrimaryHeader width={width} onClose={onClose}>
        {header}
      </PrimaryHeader>
      {children}
    </MuiDrawer>
  )
}