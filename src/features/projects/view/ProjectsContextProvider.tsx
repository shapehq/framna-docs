"use client"

import { useState } from "react"
import { ProjectsContext } from "@/common"
import { Project } from "@/features/projects/domain"

const ProjectsContextProvider = ({
  initialProjects,
  children
}: {
  initialProjects?: Project[],
  children?: React.ReactNode
}) => {
  const [refreshed, setRefreshed] = useState<boolean>(false)
  const [projects, setProjects] = useState<Project[]>(initialProjects || [])

  const hasProjectChanged = (value: Project[]) => value.some((project, index) => {
    // Compare by project id and version (or any other key fields)
    return project.id !== projects[index]?.id || project.versions !== projects[index]?.versions
  })

  const setProjectsAndRefreshed = (value: Project[]) => {
    setProjects(value)
    // If any project has changed, update the state and mark as refreshed
    if (hasProjectChanged(value)) setRefreshed(true)

  }
  return (
    <ProjectsContext.Provider value={{
      refreshed,
      projects,
      setProjects: setProjectsAndRefreshed
    }}>
      {children}
    </ProjectsContext.Provider>
  )
}

export default ProjectsContextProvider