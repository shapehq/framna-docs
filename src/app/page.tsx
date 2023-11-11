import SessionBarrier from "@/features/auth/view/SessionBarrier"
import ProjectsPage from "@/features/projects/view/ProjectsPage"
import { projectRepository } from "@/composition"

export default async function Page() {
  return (
    <SessionBarrier>
      <ProjectsPage projectRepository={projectRepository} path="/" />
    </SessionBarrier>
  )
}
