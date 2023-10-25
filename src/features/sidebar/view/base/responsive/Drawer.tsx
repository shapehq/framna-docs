import { ReactNode } from "react"
import Drawer from "../Drawer"

export default function RespnsiveDrawer({
  width,
  isOpen,
  onClose,
  children
}: {
  width: number
  isOpen: boolean
  onClose?: () => void
  children?: ReactNode
}) {
  return (
    <>
      <Drawer 
        variant="temporary"
        width={width}
        isOpen={isOpen}
        onClose={onClose}
        keepMounted={true}
        sx={{ display: { xs: "block", sm: "none" } }}
        children={children}
      />
      <Drawer 
        variant="persistent"
        width={width}
        isOpen={isOpen}
        keepMounted={false}
        sx={{ display: { xs: "none", sm: "block" } }}
        children={children}
      />
    </>
  )
}