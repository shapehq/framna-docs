import { NextRequest, NextResponse } from "next/server"
import { withAuth, CLIAuthContext } from "../middleware"
import { OpenAPIService } from "@/features/mcp/domain/OpenAPIService"
import {
  createFullGitHubClientForCLI,
  createProjectDataSourceForCLI,
  createGitHubClientForCLI,
} from "../helpers"

async function handler(
  request: NextRequest,
  auth: CLIAuthContext
): Promise<NextResponse> {
  const url = new URL(request.url)
  const project = url.searchParams.get("project")
  const path = url.searchParams.get("path")
  const method = url.searchParams.get("method")
  const version = url.searchParams.get("version") ?? undefined
  const spec = url.searchParams.get("spec") ?? undefined

  if (!project || !path || !method) {
    return NextResponse.json(
      { error: "project, path, and method parameters required" },
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
    const endpoint = await openAPIService.getEndpointDetails(
      project,
      path,
      method.toLowerCase(),
      version,
      spec
    )

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint not found" }, { status: 404 })
    }

    return NextResponse.json({ endpoint })
  } catch (error) {
    console.error("Failed to fetch endpoint:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch endpoint",
      },
      { status: 404 }
    )
  }
}

export const GET = withAuth(handler)
