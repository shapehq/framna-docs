import { getProjectId, getSpecificationId, getVersionId } from "@/common/utils/url"
import SessionOAuthTokenBarrier from "@/features/auth/view/SessionOAuthTokenBarrier"
import ProjectsPage from "@/features/projects/view/ProjectsPage"
import { projectRepository } from "@/composition"

type PageParams = { slug: string | string[] }

export default async function Page({ params }: { params: PageParams }) {
  const url = getURL(params)
  return (
    <SessionOAuthTokenBarrier>
      <ProjectsPage
        projectRepository={projectRepository}
        projectId={getProjectId(url)}
        versionId={getVersionId(url)}
        specificationId={getSpecificationId(url)}
      />
    </SessionOAuthTokenBarrier>
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