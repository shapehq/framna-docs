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

  const setProjectsAndRefreshed = (value: Project[]) => {
    setProjects(value)
    // Only set refreshed to true after projects are updated
    if (JSON.stringify(projects) !== JSON.stringify(value)) setRefreshed(true)
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