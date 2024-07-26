import SecondarySplitHeader from "@/features/sidebar/view/SecondarySplitHeader"
import TrailingToolbarItem from "@/features/projects/view/toolbar/TrailingToolbarItem"
import MobileToolbar from "@/features/projects/view/toolbar/MobileToolbar"

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SecondarySplitHeader mobileToolbar=<MobileToolbar/>>
        <TrailingToolbarItem/>
      </SecondarySplitHeader>
      <main style={{ flexGrow: "1", overflowY: "auto" }}>
        {children}
      </main>
    </>
  )
}