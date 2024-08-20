import { Suspense } from "react"
import ProjectListFallback from "./ProjectListFallback"
import { Box, Typography } from "@mui/material"
import PopulatedProjectList from "./PopulatedProjectList"
import { IProjectDataSource } from "@/features/projects/domain"

const ProjectList = ({
  projectDataSource
}: {
  projectDataSource: IProjectDataSource
}) => {
  return (
    <Suspense fallback={<ProjectListFallback/>}>
      <DataFetchingProjectList projectDataSource={projectDataSource}/>
    </Suspense>
  )
}

export default ProjectList

const DataFetchingProjectList = async ({
  projectDataSource
}: {
  projectDataSource: IProjectDataSource
}) => {
  const projects = await projectDataSource.getProjects()
  if (projects.length > 0) {
    return <PopulatedProjectList projects={projects} />
  } else {
    return <EmptyProjectList/>
  }
}

const EmptyProjectList = () => {
  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      padding: "15px",
      marginTop: "15px"
    }}>
      <Typography variant="h5" align="center">
        Your list of projects is empty.
      </Typography>
    </Box>
  )
}