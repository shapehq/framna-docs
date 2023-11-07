import { ISessionValidator, InvalidSessionError } from "../../../common"
import { IProjectDataSource ,Project } from "../domain"

export default class SessionValidatingProjectDataSource implements IProjectDataSource {
  private readonly sessionValidator: ISessionValidator
  private readonly projectDataSource: IProjectDataSource
  
  constructor(
    sessionValidator: ISessionValidator,
    projectDataSource: IProjectDataSource
  ) {
    this.sessionValidator = sessionValidator
    this.projectDataSource = projectDataSource
  }
  
  async getProjects(): Promise<Project[]> {
    const isValid = await this.sessionValidator.validateSession()
    if (!isValid) {
      throw new InvalidSessionError()
    }
    return await this.projectDataSource.getProjects()
  }
}
