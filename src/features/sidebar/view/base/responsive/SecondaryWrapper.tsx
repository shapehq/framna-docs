import { ReactNode } from "react"
import SecondaryWrapper from "../SecondaryWrapper"

export default function ResponsiveDrawer({
  drawerWidth,
  offsetContent,
  children
}: {
  drawerWidth: number
  offsetContent: boolean
  children: ReactNode
}) {
  const sx = { overflow: "hidden" }
  return (
    <>
      <SecondaryWrapper
        drawerWidth={0}
        isDrawerOpen={false}
        sx={{ ...sx, display: { xs: "flex", sm: "none" } }}
      >
        {children}
      </SecondaryWrapper>
      <SecondaryWrapper
        drawerWidth={drawerWidth}
        isDrawerOpen={offsetContent}
        sx={{ ...sx, display: { xs: "none", sm: "flex" } }}
      >
        {children}
      </SecondaryWrapper>
    </>
  )
}