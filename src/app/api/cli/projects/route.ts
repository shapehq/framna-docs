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
  try {
    const gitHubClient = createGitHubClientForCLI(auth.accessToken)
    const projectDataSource = createProjectDataSourceForCLI(gitHubClient)
    const projects = await projectDataSource.getProjects()
    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handler)
