import ProjectSummary from "./ProjectSummary"

export default interface IProjectListDataSource {
  getProjectList(): Promise<ProjectSummary[]>
}
