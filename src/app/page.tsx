import SessionOAuthTokenBarrier from "@/features/auth/view/SessionOAuthTokenBarrier"
import ProjectsPage from "@/features/projects/view/client/ProjectsPage"

export default async function Page() {
  return (
    <SessionOAuthTokenBarrier>
      <ProjectsPage/>
    </SessionOAuthTokenBarrier>
  )
}
