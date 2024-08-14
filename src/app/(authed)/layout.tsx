import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import { session, projectRepository } from "@/composition"
import ErrorHandler from "@/common/ui/ErrorHandler"
import SessionBarrier from "@/features/auth/view/SessionBarrier"
import { ProjectsContextProvider } from "@/common"
import { SplitView } from "@/features/sidebar/view"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = await session.getIsAuthenticated()
  if (!isAuthenticated) {
    return redirect("/api/auth/signin")
  }
  const projects = await projectRepository.get()
  return (
    <ErrorHandler>
      <SessionProvider>
        <SessionBarrier>
          <ProjectsContextProvider initialProjects={projects}>
            <SplitView>
              {children}
            </SplitView>
          </ProjectsContextProvider>
        </SessionBarrier>
      </SessionProvider>
    </ErrorHandler>
  )
}
