import { NextRequest, NextResponse } from "next/server"
import { withAuth, CLIAuthContext } from "../../middleware"
import { OpenAPIService } from "@/features/mcp/domain/OpenAPIService"
import {
  createFullGitHubClientForCLI,
  createProjectDataSourceForCLI,
  createGitHubClientForCLI,
} from "../../helpers"

async function handler(
  request: NextRequest,
  auth: CLIAuthContext
): Promise<NextResponse> {
  const url = new URL(request.url)
  const project = url.searchParams.get("project")
  const query = url.searchParams.get("query")
  const version = url.searchParams.get("version") ?? undefined
  const spec = url.searchParams.get("spec") ?? undefined

  if (!project || !query) {
    return NextResponse.json(
      { error: "project and query parameters required" },
      { status: 400 }
    )
  }

  try {
    const gitHubClient = createFullGitHubClientForCLI(auth.accessToken)
    const graphQLClient = createGitHubClientForCLI(auth.accessToken)
    const projectDataSource = createProjectDataSourceForCLI(graphQLClient)
    const openAPIService = new OpenAPIService({
      gitHubClient,
      projectDataSource,
    })
    const endpoints = await openAPIService.searchEndpoints(
      project,
      query,
      version,
      spec
    )
    return NextResponse.json({ endpoints })
  } catch (error) {
    console.error("Failed to search endpoints:", error)
    return NextResponse.json(
      { error: "Failed to search endpoints" },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handler)
