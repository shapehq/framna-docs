import ClientSplitView from "./internal/ClientSplitView"
import { projectDataSource } from "@/composition"
import BaseSidebar from "./internal/sidebar/Sidebar"
import ProjectList from "./internal/sidebar/projects/ProjectList"
import { env } from "@/common"

const SITE_NAME = env.getOrThrow("NEXT_PUBLIC_FRAMNA_DOCS_TITLE")

const SplitView = ({ children }: { children?: React.ReactNode }) => {
  return (
    <ClientSplitView sidebar={<Sidebar/>}>
      {children}
    </ClientSplitView>
  )
}

export default SplitView

const Sidebar = () => {
  return (
    // The site name is passed as a property to ensure the environment variable is read server-side.
    <BaseSidebar siteName={SITE_NAME}>
      <ProjectList projectDataSource={projectDataSource} />
    </BaseSidebar>
  )
}
