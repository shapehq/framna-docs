"use client"

import dynamic from "next/dynamic"
import { ReactNode } from "react"
import { useSessionStorage } from "usehooks-ts"
import ResponsiveSidebarContainer from "../base/responsive/SidebarContainer"
import Sidebar from "../Sidebar"
import SidebarHeader from "../SidebarHeader"
import TrailingToolbar from "./TrailingToolbar"

const SidebarContainer = ({
  sidebar,
  children,
  trailingToolbar
}: {
  sidebar?: ReactNode
  children?: ReactNode
  trailingToolbar?: ReactNode
}) => {
  const [open, setOpen] = useSessionStorage("isDrawerOpen", true)
  return (
    <ResponsiveSidebarContainer
      isDrawerOpen={open}
      onToggleDrawerOpen={setOpen}
      sidebarHeader={
        <SidebarHeader/>
      }
      sidebar={
        <Sidebar>
          {sidebar}
        </Sidebar>
      }
      header={trailingToolbar &&
        <TrailingToolbar>
          {trailingToolbar}
        </TrailingToolbar>
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
