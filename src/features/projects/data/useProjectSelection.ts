"use client"

import NProgress from "nprogress"
import { useRouter, usePathname } from "next/navigation"
import { useContext } from "react"
import { ProjectsContext } from "@/common"
import {
  Project,
  ProjectNavigator,
  getProjectSelectionFromPath,
  getDefaultSpecification
  
} from "../domain"

export default function useProjectSelection() {
  const router = useRouter()
  const pathname = usePathname()
  const { projects } = useContext(ProjectsContext)
  const selection = getProjectSelectionFromPath({ projects, path: pathname })
  const pathnameReader = {
    get pathname() {
      return pathname
    }
  }
  const projectNavigator = new ProjectNavigator({ router, pathnameReader })
  return {
    get project() {
      return selection.project
    },
    get version() {
      return selection.version
    },
    get specification() {
      return selection.specification
    },
    selectProject: (project: Project) => {
      const version = project.versions[0]
      const specification = getDefaultSpecification(version)
      NProgress.start()
      projectNavigator.navigate(
        project.owner,
        project.name,
        version.id,
        specification.id
      )
    },
    selectVersion: (versionId: string) => {
      NProgress.start()
      projectNavigator.navigateToVersion(
        selection.project!,
        versionId,
        selection.specification!.name
      )
    },
    selectSpecification: (specificationId: string) => {
      NProgress.start()
      projectNavigator.navigate(
        selection.project!.owner,
        selection.project!.name,
        selection.version!.id, specificationId
      )
    },
    navigateToSelectionIfNeeded: () => {
      projectNavigator.navigateIfNeeded({
        projectOwner: selection.project?.owner,
        projectName: selection.project?.name,
        versionId: selection.version?.id,
        specificationId: selection.specification?.id
      })
    }
  }
}
