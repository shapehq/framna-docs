import { Suspense } from "react"
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
  return <PopulatedProjectList projects={projects} />
}
