import { ReactNode } from "react"
import SecondaryHeader from "../SecondaryHeader"

export default function RespnsiveDrawer({
  drawerWidth,
  offsetContent,
  onOpen,
  children
}: {
  drawerWidth: number
  offsetContent: boolean
  onOpen: () => void
  children: ReactNode
}) {
  return (
    <>
      <SecondaryHeader
        drawerWidth={drawerWidth}
        isDrawerOpen={false}
        onOpen={onOpen}
        sx={{ display: { xs: "block", sm: "none" } }}
      >
        {children}
      </SecondaryHeader>
      <SecondaryHeader
        drawerWidth={drawerWidth}
        isDrawerOpen={offsetContent}
        onOpen={onOpen}
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        {children}
      </SecondaryHeader>
    </>
  )
}