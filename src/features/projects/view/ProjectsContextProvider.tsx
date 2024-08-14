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
  const [projects, setProjects] = useState<Project[]>(initialProjects || [])
  return (
    <ProjectsContext.Provider value={{ projects, setProjects }}>
      {children}
    </ProjectsContext.Provider>
  )
}

export default ProjectsContextProvider