"use client"

import { Suspense, useContext } from "react"
import { Typography } from "@mui/material"
import ProjectListFallback from "./ProjectListFallback"
import PopulatedProjectList from "./PopulatedProjectList"
import { ProjectsContext } from "@/common"

const ProjectList = () => {
  const { projects } = useContext(ProjectsContext)
  
  return (
    <Suspense fallback={<ProjectListFallback/>}>
      {projects.length > 0 ? <PopulatedProjectList projects={projects} /> : <EmptyProjectList/>}
    </Suspense>
  )
}

export default ProjectList

const EmptyProjectList = () => {
  return (
    <Typography
      variant="body2"
      sx={{
        margin: 2,
        marginBottom: 4
      }}
    >
      Your list of projects is empty.
    </Typography>
  )
}
