import ProjectsPage from "@/features/projects/view/ProjectsPage"
import { projectRepository } from "@/composition"

export default async function Page() {
  return <ProjectsPage projectRepository={projectRepository} path="/" />
}
