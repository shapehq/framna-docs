import ClientSplitView from "./internal/ClientSplitView"
import { projectDataSource } from "@/composition"
import BaseSidebar from "./internal/sidebar/Sidebar"
import ProjectList from "./internal/sidebar/projects/ProjectList"

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
    <BaseSidebar>
      <ProjectList projectDataSource={projectDataSource} />
    </BaseSidebar>
  )
}
