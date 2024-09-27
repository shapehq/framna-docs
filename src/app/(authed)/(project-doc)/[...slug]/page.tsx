"use client"

import { useEffect, useContext } from "react"
import ErrorMessage from "@/common/ui/ErrorMessage"
import { updateWindowTitle } from "@/features/projects/domain"
import { useProjectSelection } from "@/features/projects/data"
import Documentation from "@/features/projects/view/Documentation"
import NotFound from "@/features/projects/view/NotFound"
import { ProjectsContext } from "@/common"

export default function Page() {
  const { cached } = useContext(ProjectsContext)
  const { project, version, specification, navigateToSelectionIfNeeded } = useProjectSelection()
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
      {project && !version && !cached &&
        <ErrorMessage text="The selected branch or tag was not found."/>
      }
      {project && !specification && !cached &&
        <ErrorMessage text="The selected specification was not found."/>
      }
      {!project && !cached && <NotFound/>}
    </>
  )
}
