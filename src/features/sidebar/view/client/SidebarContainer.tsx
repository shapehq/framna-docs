"use client"

import dynamic from "next/dynamic"
import { ReactNode } from "react"
import { useSessionStorage } from "usehooks-ts"
import ResponsiveSidebarContainer from "../base/responsive/SidebarContainer"
import ResponsiveSecondaryHeader from "../base/responsive/SecondaryHeader"
import Sidebar from "../Sidebar"

const SidebarContainer = ({
  isSidebarOpen,
  onToggleSidebarOpen,
  showHeader: _showHeader,
  sidebar,
  children,
  toolbarTrailingItem,
  mobileToolbar
}: {
  isSidebarOpen: boolean,
  onToggleSidebarOpen: (isSidebarOpen: boolean) => void,
  showHeader?: boolean,
  sidebar?: ReactNode
  children?: ReactNode
  toolbarTrailingItem?: ReactNode
  mobileToolbar?: ReactNode
}) => {
  const [showMobileToolbar, setShowMobileToolbar] = useSessionStorage("isMobileToolbarVisible", true)
  const showHeader = _showHeader || _showHeader === undefined
  return (
    <ResponsiveSidebarContainer
      isSidebarOpen={isSidebarOpen}
      onToggleSidebarOpen={onToggleSidebarOpen}
      sidebar={
        <Sidebar>
          {sidebar}
        </Sidebar>
      }
      header={showHeader &&
        <ResponsiveSecondaryHeader
          showOpenSidebar={!isSidebarOpen}
          showCloseSidebar={isSidebarOpen}
          onToggleSidebarOpen={onToggleSidebarOpen}
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
