import { getProjectId, getSpecificationId, getVersionId } from "../../common"
import SessionAccessTokenBarrier from "@/features/auth/view/SessionAccessTokenBarrier"
import ProjectsPage from "@/features/projects/view/ProjectsPage"
import { projectRepository } from "@/composition"

type PageParams = { slug: string | string[] }

export default async function Page({ params }: { params: PageParams }) {
  const url = getURL(params)
  return (
    <SessionAccessTokenBarrier>
      <ProjectsPage
        projectRepository={projectRepository}
        projectId={getProjectId(url)}
        versionId={getVersionId(url)}
        specificationId={getSpecificationId(url)}
      />
    </SessionAccessTokenBarrier>
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