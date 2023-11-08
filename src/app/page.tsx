import SessionAccessTokenBarrier from "@/features/auth/view/SessionAccessTokenBarrier"
import ProjectsPage from "@/features/projects/view/ProjectsPage"
import { projectRepository } from "@/composition"

export default async function Page() {
  return (
    <SessionAccessTokenBarrier>
      <ProjectsPage projectRepository={projectRepository} />
    </SessionAccessTokenBarrier>
  )
}
