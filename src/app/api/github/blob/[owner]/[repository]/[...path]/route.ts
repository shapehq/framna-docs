import { NextRequest, NextResponse } from "next/server"
import { gitHubClient } from "@/composition"

interface GetBlobParams {
  owner: string
  repository: string
  path: [string]
}

export async function GET(req: NextRequest, { params }: { params: GetBlobParams }) {
  const item = await gitHubClient.getRepositoryContent({
    repositoryOwner: params.owner,
    repositoryName: params.repository,
    path:  params.path.join("/"),
    ref: req.nextUrl.searchParams.get("ref") || undefined
  })
  const url = new URL(item.downloadURL)
  return NextResponse.redirect(url)
}
