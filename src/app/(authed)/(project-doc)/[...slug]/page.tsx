"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import ErrorMessage from "@/common/ui/ErrorMessage"
import { updateWindowTitle } from "@/features/projects/domain"
import { useProjectSelection } from "@/features/projects/data"
import Documentation from "@/features/projects/view/Documentation"
import NotFound from "@/features/projects/view/NotFound"
import { useProjectDetails } from "@/features/projects/view/ProjectDetailsContext"
import LoadingIndicator from "@/common/ui/LoadingIndicator"

export default function Page() {
  const params = useParams()
  const slug = params.slug as string[] | undefined
  const owner = slug?.[0]
  const name = slug?.[1]

  const { fetchProject, isLoading, getError } = useProjectDetails()
  const { project, version, specification, navigateToSelectionIfNeeded } = useProjectSelection()

  const loading = owner && name ? isLoading(owner, name) : false
  const error = owner && name ? getError(owner, name) : null

  // Fetch project details when the page loads
  useEffect(() => {
    if (owner && name && !project) {
      fetchProject(owner, name)
    }
  }, [owner, name, project, fetchProject])

  // Ensure the URL reflects the current selection of project, version, and specification.
  useEffect(() => {
    navigateToSelectionIfNeeded()
  }, [project, version, specification, navigateToSelectionIfNeeded])

  useEffect(() => {
    if (!project) {
      return
    }
    updateWindowTitle({
      storage: document,
      project,
      version,
      specification
    })
  }, [project, version, specification])

  if (loading) {
    return <LoadingIndicator />
  }

  if (error) {
    return <ErrorMessage text={error} />
  }

  return (
    <>
      {project && version && specification &&
        <Documentation url={specification.url} />
      }
      {project && (!version || !specification) &&
        <ErrorMessage text={`The selected ${!version ? "branch or tag" : "specification"} was not found.`}/>
      }
      {!project && <NotFound/>}
    </>
  )
}
