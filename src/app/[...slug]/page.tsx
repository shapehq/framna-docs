import { getProjectId, getSpecificationId, getVersionId } from "@/common/UrlUtils"
import ProjectsPage from "@/features/projects/view/ProjectsPage"

type PageParams = { slug: string | string[] }

export default function Page({ params }: { params: PageParams }) {
  const url = getURL(params)
  return (
    <ProjectsPage
      projectId={getProjectId(url)}
      versionId={getVersionId(url)}
      specificationId={getSpecificationId(url)}
    />
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