import { InvalidSessionError } from "../../../common/errors"
import ISessionValidator from "@/common/session/ISessionValidator"
import IProjectDataSource from "../domain/IProjectDataSource"
import Project from "../domain/Project"

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
