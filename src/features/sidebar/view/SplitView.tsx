import ClientSplitView from "./internal/ClientSplitView"
import BaseSidebar from "./internal/sidebar/Sidebar"
import ProjectList from "./internal/sidebar/projects/ProjectList"
import { env } from "@/common"

const SITE_NAME = env.getOrThrow("FRAMNA_DOCS_TITLE")
const HELP_URL = env.get("FRAMNA_DOCS_HELP_URL")

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
    // The site name and help URL are passed as a properties to ensure the environment variables are read server-side.
    <BaseSidebar siteName={SITE_NAME} helpURL={HELP_URL}>
      <ProjectList />
    </BaseSidebar>
  )
}
