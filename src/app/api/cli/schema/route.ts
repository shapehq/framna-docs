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
  const name = url.searchParams.get("name")
  const version = url.searchParams.get("version") ?? undefined
  const spec = url.searchParams.get("spec") ?? undefined

  if (!project || !name) {
    return NextResponse.json(
      { error: "project and name parameters required" },
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
    const schema = await openAPIService.getSchema(project, name, version, spec)

    if (!schema) {
      return NextResponse.json({ error: "Schema not found" }, { status: 404 })
    }

    return NextResponse.json({ schema })
  } catch (error) {
    console.error("Failed to fetch schema:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch schema",
      },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handler)
