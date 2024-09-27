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
  const [cached, setCached] = useState<boolean>(true)
  const [projects, setProjects] = useState<Project[]>(initialProjects || [])
  const setProjectsAndCached = (projects: Project[]) => {
    setProjects(projects)
    setCached(false)
  }
  return (
    <ProjectsContext.Provider value={{
      cached,
      projects,
      setProjects: setProjectsAndCached
    }}>
      {children}
    </ProjectsContext.Provider>
  )
}

export default ProjectsContextProvider