import { Suspense } from "react"
import { Typography } from "@mui/material"
import ProjectListFallback from "./ProjectListFallback"
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
