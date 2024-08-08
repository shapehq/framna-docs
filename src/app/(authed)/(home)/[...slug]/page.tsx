"use client"

import { useContext, useEffect } from "react"
import { ProjectsContainerContext } from "@/common"
import DelayedLoadingIndicator from "@/common/ui/DelayedLoadingIndicator"
import ErrorMessage from "@/common/ui/ErrorMessage"
import { updateWindowTitle } from "@/features/projects/domain"
import { useProjectSelection } from "@/features/projects/data"
import Documentation from "@/features/projects/view/Documentation"

export default function Page() {
  const { error, isLoading } = useContext(ProjectsContainerContext)
  const { project, version, specification, navigateToSelectionIfNeeded } = useProjectSelection()
  // Ensure the URL reflects the current selection of project, version, and specification.
  useEffect(() => {
    navigateToSelectionIfNeeded()
  }, [project, version, specification, navigateToSelectionIfNeeded])
  // Update the window title to match selected project.
  const siteName = process.env.NEXT_PUBLIC_SHAPE_DOCS_TITLE || ""
  useEffect(() => {
    updateWindowTitle({
      storage: document,
      defaultTitle: siteName,
      project,
      version,
      specification
    })
  }, [siteName, project, version, specification])
  if (project && version && specification) {
    return <Documentation url={specification.url}/>
  } else if (project && !version) {
    return <ErrorMessage text="The selected branch or tag was not found."/>
  } else if (project && !specification) {
    return <ErrorMessage text="The selected specification was not found."/>
  } else if (isLoading) {
    return <DelayedLoadingIndicator/>
  } else if (error) {
    return <ErrorMessage text={error.message}/>
  } else {
    // No project is selected so we will not show anything.
    return <></>
  }
}
