import { NextRequest, NextResponse } from "next/server"
import { withAuth, CLIAuthContext } from "../middleware"
import { OpenAPIService } from "@/features/mcp/domain/OpenAPIService"
import {
  createFullGitHubClientForCLI,
  createGitHubClientForCLI,
  createProjectListDataSourceForCLI,
  createProjectDetailsDataSourceForCLI,
} from "../helpers"

async function handler(
  request: NextRequest,
  auth: CLIAuthContext
): Promise<NextResponse> {
  const url = new URL(request.url)
  const project = url.searchParams.get("project")
  const version = url.searchParams.get("version") ?? undefined
  const spec = url.searchParams.get("spec") ?? undefined

  if (!project) {
    return NextResponse.json(
      { error: "project parameter required" },
      { status: 400 }
    )
  }

  try {
    const gitHubClient = createFullGitHubClientForCLI(auth.accessToken)
    const graphQLClient = createGitHubClientForCLI(auth.accessToken)
    const openAPIService = new OpenAPIService({
      gitHubClient,
      projectListDataSource: createProjectListDataSourceForCLI(graphQLClient),
      projectDetailsDataSource: createProjectDetailsDataSourceForCLI(graphQLClient),
    })
    const endpoints = await openAPIService.listEndpoints(project, version, spec)
    return NextResponse.json({ endpoints })
  } catch (error) {
    console.error("Failed to fetch endpoints:", error)
    return NextResponse.json(
      { error: "Failed to fetch endpoints" },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handler)
