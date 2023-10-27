import { ReactNode } from "react"
import SecondaryWrapper from "../SecondaryWrapper"

export default function ResponsiveSecondaryWrapper({
  sidebarWidth,
  offsetContent,
  children
}: {
  sidebarWidth: number
  offsetContent: boolean
  children: ReactNode
}) {
  const sx = { overflow: "hidden" }
  return (
    <>
      <SecondaryWrapper
        sidebarWidth={0}
        isSidebarOpen={false}
        sx={{ ...sx, display: { xs: "flex", sm: "none" } }}
      >
        {children}
      </SecondaryWrapper>
      <SecondaryWrapper
        sidebarWidth={sidebarWidth}
        isSidebarOpen={offsetContent}
        sx={{ ...sx, display: { xs: "none", sm: "flex" } }}
      >
        {children}
      </SecondaryWrapper>
    </>
  )
}