import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import { session } from "@/composition"
import ErrorHandler from "@/common/errors/client/ErrorHandler"
import SessionBarrier from "@/features/auth/view/SessionBarrier"
import NewProjectPage from "@/features/projects/view/NewProjectPage"
import { env } from "@/common"

export default async function Page() {
  const isAuthenticated = await session.getIsAuthenticated()
  if (!isAuthenticated) {
    return redirect("/api/auth/signin")
  }
  return (
    <ErrorHandler>
      <SessionProvider>
        <SessionBarrier>
          <NewProjectPage
            repositoryNameSuffix={env.getOrThrow("REPOSITORY_NAME_SUFFIX")}
            templateName={env.get("NEW_PROJECT_TEMPLATE_REPOSITORY")}
          />
        </SessionBarrier>
      </SessionProvider>
    </ErrorHandler>
  )
}
