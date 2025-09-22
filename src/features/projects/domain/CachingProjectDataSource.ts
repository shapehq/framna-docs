import Project from "./Project";
import IProjectDataSource from "./IProjectDataSource";
import IProjectRepository from "./IProjectRepository";
import { revalidatePath } from "next/cache";


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

  /* async getProjects(): Promise<Project[]> {
    const projects = await this.dataSource.getProjects()
    await this.repository.set(projects)
    return projects
  } */
 

  async getProjects(): Promise<Project[]> {
    const cache = await this.repository.get();
    console.log("Loaded projects from cache:", cache);
    if (cache) return cache;
    else {
      const projects = await this.dataSource.getProjects();
      await this.repository.set(projects);
      console.log("fetching projects:", projects);
      return projects;
    }
  }

async refreshProjects(): Promise<Project[]> {
    const projects = await this.dataSource.getProjects();
    await this.repository.set(projects);
    console.log("refreshed projects:", projects);
    return projects;
  }
}
