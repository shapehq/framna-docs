import { NextRequest, NextResponse } from "next/server"
import { session, diffCalculator } from "@/composition"
import { makeUnauthenticatedAPIErrorResponse } from "@/common"

interface GetDiffParams {
  owner: string
  repository: string
  path: string[]
}

export async function GET(req: NextRequest, { params }: { params: Promise<GetDiffParams> }) {
  const isAuthenticated = await session.getIsAuthenticated()
  if (!isAuthenticated) {
    return makeUnauthenticatedAPIErrorResponse()
  }

  if (!diffCalculator) {
    return NextResponse.json(
      { error: "Diff calculation is not available for this provider" },
      { status: 501 }
    )
  }

  const { path: paramsPath, owner, repository } = await params
  const path = paramsPath.join("/")

  const toRef = req.nextUrl.searchParams.get("to")
  const baseRefOid = req.nextUrl.searchParams.get("baseRefOid")

  if (!toRef) {
    return NextResponse.json({ error: "Missing 'to' parameter" }, { status: 400 })
  }

  if (!baseRefOid) {
    return NextResponse.json({ error: "Missing 'baseRefOid' parameter" }, { status: 400 })
  }

  try {
    const diff = await diffCalculator.calculateDiff(
      owner,
      repository,
      path,
      baseRefOid,
      toRef
    )

    return NextResponse.json(diff)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error while calculating diff"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
