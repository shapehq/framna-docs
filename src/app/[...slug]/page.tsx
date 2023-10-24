import { getProjectId, getSpecificationId, getVersionId } from "@/common/utils/url"
import SessionOAuthTokenBarrier from "@/features/auth/view/SessionOAuthTokenBarrier"
import ProjectsPage from "@/features/projects/view/client/ProjectsPage"

type PageParams = { slug: string | string[] }

export default async function Page({ params }: { params: PageParams }) {
  const url = getURL(params)
  return (
    <SessionOAuthTokenBarrier>
      <ProjectsPage
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