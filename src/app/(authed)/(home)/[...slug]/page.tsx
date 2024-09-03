"use client"

import { useEffect } from "react"
import { Box } from "@mui/material"
import ErrorMessage from "@/common/ui/ErrorMessage"
import { updateWindowTitle } from "@/features/projects/domain"
import { useProjectSelection } from "@/features/projects/data"
import Documentation from "@/features/projects/view/Documentation"

export default function Page() {
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
  return (
    <>
      {project && version && specification &&
        <Documentation url={specification.url} />
      }
      {project && !version &&
        <ErrorMessage text="The selected branch or tag was not found."/>
      }
      {project && !specification &&
        <ErrorMessage text="The selected specification was not found."/>
      }
    </>
  )
}
