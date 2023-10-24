import SessionOAuthTokenBarrier from "@/features/auth/view/SessionOAuthTokenBarrier"
import ProjectsPage from "@/features/projects/view/ProjectsPage"

export default async function Page() {
  return (
    <SessionOAuthTokenBarrier>
      <ProjectsPage/>
    </SessionOAuthTokenBarrier>
  )
}
