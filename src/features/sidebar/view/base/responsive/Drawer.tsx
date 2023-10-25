import { ReactNode } from "react"
import Drawer from "../Drawer"

export default function RespnsiveDrawer({
  width,
  isOpen,
  header,
  onClose,
  children
}: {
  width: number
  isOpen: boolean
  header: ReactNode,
  onClose: () => void,
  children?: ReactNode
}) {
  return (
    <>
      <Drawer 
        variant="temporary"
        width={width}
        isOpen={isOpen}
        onClose={onClose}
        header={header}
        sx={{ display: { xs: "block", sm: "none" } }}
      >
        {children}
      </Drawer>
      <Drawer 
        variant="persistent"
        width={width}
        isOpen={isOpen}
        onClose={onClose}
        header={header}
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        {children}
      </Drawer>
    </>
  )
}