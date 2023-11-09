import { getProjectId, getSpecificationId, getVersionId } from "../../common"
import SessionBarrier from "@/features/auth/view/SessionBarrier"
import ProjectsPage from "@/features/projects/view/ProjectsPage"
import { projectRepository } from "@/composition"

type PageParams = { slug: string | string[] }

export default async function Page({ params }: { params: PageParams }) {
  const url = getURL(params)
  return (
    <SessionBarrier>
      <ProjectsPage
        projectRepository={projectRepository}
        projectId={getProjectId(url)}
        versionId={getVersionId(url)}
        specificationId={getSpecificationId(url)}
      />
    </SessionBarrier>
  )
}

function getURL(params: PageParams) {
  if (typeof params.slug === "string") {
    return "/" + params.slug
  } else {
    return params.slug.reduce(
      (previousValue, currentValue) => `${previousValue}/${currentValue}`,
      ""
    )
  }
}