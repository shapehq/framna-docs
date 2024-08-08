"use client"

import SecondarySplitHeader from "@/features/sidebar/view/SecondarySplitHeader"
import TrailingToolbarItem from "@/features/projects/view/toolbar/TrailingToolbarItem"
import MobileToolbar from "@/features/projects/view/toolbar/MobileToolbar"
import { useProjectSelection } from "@/features/projects/data"

export default function Page({ children }: { children: React.ReactNode }) {
  const { project } = useProjectSelection()
  if (!project) {
    return <></>
  }
  return (
    <>
      <SecondarySplitHeader mobileToolbar={<MobileToolbar/>}>
        <TrailingToolbarItem/>
      </SecondarySplitHeader>
      <main style={{ flexGrow: "1", overflowY: "auto" }}>
        {children}
      </main>
    </>
  )
}