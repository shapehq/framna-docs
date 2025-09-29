import Project from "./Project";
import IProjectDataSource from "./IProjectDataSource";
import IProjectRepository from "./IProjectRepository";


export default class CachingProjectDataSource implements IProjectDataSource {
  private dataSource: IProjectDataSource;
  private repository: IProjectRepository;

  constructor(config: {
    dataSource: IProjectDataSource;
    repository: IProjectRepository;
  }) {
    this.dataSource = config.dataSource;
    this.repository = config.repository;
  }

  async getProjects(): Promise<Project[]> {
    const cache = await this.repository.get();

    if (cache) return cache;
    else {
      const projects = await this.dataSource.getProjects();
      await this.repository.set(projects);

      return projects;
    }
  }

  async refreshProjects(): Promise<Project[]> {
    const projects = await this.dataSource.getProjects();
    await this.repository.set(projects);
    return projects;
  }
}
