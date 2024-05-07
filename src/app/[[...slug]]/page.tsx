import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import { session, projectRepository } from "@/composition"
import ErrorHandler from "@/common/errors/client/ErrorHandler"
import SessionBarrier from "@/features/auth/view/SessionBarrier"
import ProjectsPage from "@/features/projects/view/ProjectsPage"

type PageParams = { slug: string | string[] }

export default async function Page({ params }: { params: PageParams }) {
  const isAuthenticated = await session.getIsAuthenticated()
  if (!isAuthenticated) {
    return redirect("/api/auth/signin")
  }
  return (
    <ErrorHandler>
      <SessionProvider>
        <SessionBarrier>
          <ProjectsPage
            projectRepository={projectRepository}
            path={getPath(params.slug)}
          />
        </SessionBarrier>
      </SessionProvider>
    </ErrorHandler>
  )
}

function getPath(slug: string | string[] | undefined) {
  console.log("Slug: " + slug)
  if (slug === undefined) {
    return "/"
  } else if (typeof slug === "string") {
    return "/" + slug
  } else {
    return slug.reduce((e, acc) => `${e}/${acc}`, "")
  }
}
