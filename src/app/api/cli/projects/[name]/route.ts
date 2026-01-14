import { NextRequest, NextResponse } from "next/server"
import { withAuth, CLIAuthContext } from "../../middleware"
import {
  createGitHubClientForCLI,
  createProjectDataSourceForCLI,
} from "../../helpers"

type RouteParams = { params: Promise<{ name: string }> }

async function handler(
  _request: NextRequest,
  auth: CLIAuthContext,
  routeParams: RouteParams
): Promise<NextResponse> {
  try {
    const { name } = await routeParams.params
    const gitHubClient = createGitHubClientForCLI(auth.accessToken)
    const projectDataSource = createProjectDataSourceForCLI(gitHubClient)
    const projects = await projectDataSource.getProjects()
    const project = projects.find((p) => p.name === name)

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Failed to fetch project:", error)
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  routeParams: RouteParams
): Promise<NextResponse> {
  const wrappedHandler = withAuth((req, auth) => handler(req, auth, routeParams))
  return wrappedHandler(request)
}
