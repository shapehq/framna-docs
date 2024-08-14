"use client"

import { createContext, useState } from "react"
import { Project } from "@/features/projects/domain"

type ProjectsContextValue = {
  projects: Project[],
  setProjects: (projects: Project[]) => void
}

export const ProjectsContext = createContext<ProjectsContextValue>({
  projects: [],
  setProjects: () => {}
})

export const ProjectsContextProvider = ({
  initialProjects,
  children
}: {
  initialProjects?: Project[],
  children?: React.ReactNode
}) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects || [])
  return (
    <ProjectsContext.Provider value={{ projects, setProjects }}>
      {children}
    </ProjectsContext.Provider>
  )
}
