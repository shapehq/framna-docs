"use client"

import { useContext, useEffect } from "react"
import { ProjectsContext } from "@/common"
import SpacedList from "@/common/ui/SpacedList"
import { Project } from "@/features/projects/domain"
import ProjectListItem from "./ProjectListItem"

const PopulatedProjectList = ({ projects }: { projects: Project[] }) => {
  // Ensure that context reflects the displayed projects.
  const { setProjects } = useContext(ProjectsContext)
  useEffect(() => {
    setProjects(projects)
  }, [])
  return (
    <SpacedList itemSpacing={1}>
      {projects.map(project => (
        <ProjectListItem key={project.id} project={project} />
      ))}
    </SpacedList>
  )
}

export default PopulatedProjectList
