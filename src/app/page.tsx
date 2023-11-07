import SessionOAuthTokenBarrier from "@/features/auth/view/SessionOAuthTokenBarrier"
import ProjectsPage from "@/features/projects/view/ProjectsPage"
import { projectRepository } from "@/composition"

export default async function Page() {
  return (
    <SessionOAuthTokenBarrier>
      <ProjectsPage projectRepository={projectRepository} />
    </SessionOAuthTokenBarrier>
  )
}
