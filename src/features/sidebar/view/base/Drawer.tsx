import { ReactNode } from "react"
import { SxProps } from "@mui/system"
import { Drawer as MuiDrawer } from "@mui/material"

export default function Drawer({
  variant,
  width,
  isOpen,
  onClose,
  keepMounted,
  sx,
  children
}: {
  variant: "persistent" | "temporary",
  width: number
  isOpen: boolean
  onClose?: () => void
  keepMounted?: boolean
  sx: SxProps,
  children?: ReactNode
}) {
  return (
    <MuiDrawer
      variant={variant}
      anchor="left"
      open={isOpen}
      onClose={onClose}
      ModalProps={{
        keepMounted: keepMounted || false
      }}
      sx={{ 
       ...sx,
       width: width,
       flexShrink: 0,
       "& .MuiDrawer-paper": {
         width: width,
         boxSizing: "border-box"
       }
     }}
     children={children}
    />
  )
}