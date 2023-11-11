import SessionBarrier from "@/features/auth/view/SessionBarrier"
import ProjectsPage from "@/features/projects/view/ProjectsPage"
import { projectRepository } from "@/composition"

type PageParams = { slug: string | string[] }

export default async function Page({ params }: { params: PageParams }) {
  return (
    <SessionBarrier>
      <ProjectsPage
        projectRepository={projectRepository}
        path={getPath(params.slug)}
      />
    </SessionBarrier>
  )
}

function getPath(slug: string | string[]) {
  if (typeof slug === "string") {
    return "/" + slug
  } else {
    return slug.reduce((e, acc) => `${e}/${acc}`, "")
  }
}
