"use client"

import { useContext, useEffect } from "react"
import ErrorMessage from "@/common/ui/ErrorMessage"
import { updateWindowTitle } from "@/features/projects/domain"
import { useProjectSelection } from "@/features/projects/data"
import Documentation from "@/features/projects/view/Documentation"
import NotFound from "@/features/projects/view/NotFound"
import { ProjectsContext } from "@/common/context/ProjectsContext"
import LoadingIndicator from "@/common/ui/LoadingIndicator"

export default function Page() {
  const { project, version, specification, navigateToSelectionIfNeeded } = useProjectSelection()
  const { refreshing } = useContext(ProjectsContext)
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

  return (
    <>
      {project && version && specification &&
        <Documentation url={specification.url} />
      }
      {project && (!version || !specification) && !refreshing && 
        <ErrorMessage text={`The selected ${!version ? "branch or tag" : "specification"} was not found.`}/>
      }
      {refreshing && // project data is currently being fetched - show loading indicator
        <LoadingIndicator />
      }
      {!project && !refreshing && <NotFound/>}
    </>
  )
}
