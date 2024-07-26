import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import { session } from "@/composition"
import ErrorHandler from "@/common/ui/ErrorHandler"
import SessionBarrier from "@/features/auth/view/SessionBarrier"
import { projectRepository } from "@/composition"
import ServerSideCachedProjectsProvider from "@/features/projects/view/ServerSideCachedProjectsProvider"

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
          <ServerSideCachedProjectsProvider projects={projects}>
            {children}
          </ServerSideCachedProjectsProvider>
        </SessionBarrier>
      </SessionProvider>
    </ErrorHandler>
  )
}