import { ReactNode } from "react"
import SecondaryContent from "../SecondaryContent"

export default function RespnsiveDrawer({
  drawerWidth,
  offsetContent,
  children
}: {
  drawerWidth: number
  offsetContent: boolean
  children: ReactNode
}) {
  return (
    <>
      <SecondaryContent
        drawerWidth={0}
        isDrawerOpen={false}
        sx={{ display: { xs: "block", sm: "none" } }}
      >
        {children}
      </SecondaryContent>
      <SecondaryContent
        drawerWidth={drawerWidth}
        isDrawerOpen={offsetContent}
        sx={{ display: { xs: "none", sm: "block" } }}
      >
        {children}
      </SecondaryContent>
    </>
  )
}