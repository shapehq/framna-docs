import { NextRequest, NextResponse } from "next/server"
import { withAuth, CLIAuthContext } from "../middleware"
import {
  createGitHubClientForCLI,
  createProjectDataSourceForCLI,
} from "../helpers"

async function handler(
  _request: NextRequest,
  auth: CLIAuthContext
): Promise<NextResponse> {
  const gitHubClient = createGitHubClientForCLI(auth.accessToken)
  const projectDataSource = createProjectDataSourceForCLI(gitHubClient)
  const projects = await projectDataSource.getProjects()

  return NextResponse.json({ projects })
}

export const GET = withAuth(handler)
