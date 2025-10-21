  import { NextRequest, NextResponse } from "next/server"
import { session, userGitHubClient } from "@/composition"
import { makeUnauthenticatedAPIErrorResponse } from "@/common"
import { execSync } from "child_process"

interface GetDiffParams {
  owner: string
  repository: string
  path: [string]
}

export async function GET(req: NextRequest, { params }: { params: Promise<GetDiffParams> }) {
  const isAuthenticated = await session.getIsAuthenticated()
  if (!isAuthenticated) {
    return makeUnauthenticatedAPIErrorResponse()
  }

  const { path: paramsPath, owner, repository } = await params
  const path = paramsPath.join("/")
  
  const fromRef = req.nextUrl.searchParams.get("from")
  const toRef = req.nextUrl.searchParams.get("to")
  
  if (!fromRef || !toRef) {
    return NextResponse.json({ error: "Missing from/to parameters" }, { status: 400 })
  }

  const fullRepositoryName = repository + "-openapi"

  const spec1 = await userGitHubClient.getRepositoryContent({
    repositoryOwner: owner,
    repositoryName: fullRepositoryName,
    path: path,
    ref: fromRef
  })

  const spec2 = await userGitHubClient.getRepositoryContent({
    repositoryOwner: owner,
    repositoryName: fullRepositoryName,
    path: path, 
    ref: toRef
  })

  const result = execSync(`oasdiff changelog --format json "${spec1.downloadURL}" "${spec2.downloadURL}"`, { encoding: 'utf8' })

  
  const diffData = JSON.parse(result)
 
  return NextResponse.json({
    from: fromRef,
    to: toRef,
    changes: diffData 
  })
}