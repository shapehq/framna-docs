"use client"

import dynamic from "next/dynamic"
import { ReactNode } from "react"
import { useSessionStorage } from "usehooks-ts"
import ResponsiveSidebarContainer from "../base/responsive/SidebarContainer"
import ResponsiveSecondaryHeader from "../base/responsive/SecondaryHeader"
import Sidebar from "../Sidebar"
import SidebarHeader from "../SidebarHeader"

const SidebarContainer = ({
  sidebar,
  children,
  toolbarTrailingItem,
  mobileToolbar
}: {
  sidebar?: ReactNode
  children?: ReactNode
  toolbarTrailingItem?: ReactNode
  mobileToolbar?: ReactNode
}) => {
  const [open, setOpen] = useSessionStorage("isDrawerOpen", true)
  const [showMobileToolbar, setShowMobileToolbar] = useSessionStorage("isMobileToolbarVisible", true)
  return (
    <ResponsiveSidebarContainer
      isDrawerOpen={open}
      onToggleDrawerOpen={setOpen}
      sidebarHeader={<SidebarHeader/>}
      sidebar={
        <Sidebar>
          {sidebar}
        </Sidebar>
      }
      header={
        <ResponsiveSecondaryHeader
          showOpenDrawer={!open}
          onOpenDrawer={() => setOpen(true)}
          showMobileToolbar={showMobileToolbar}
          onToggleMobileToolbar={setShowMobileToolbar}
          trailingItem={toolbarTrailingItem}
          mobileToolbar={mobileToolbar}
        />
      }
    >
      {children}
    </ResponsiveSidebarContainer>
  )
}

// Disable server-side rendering as this component uses the window instance to manage its state.
export default dynamic(() => Promise.resolve(SidebarContainer), {
  ssr: false
})
