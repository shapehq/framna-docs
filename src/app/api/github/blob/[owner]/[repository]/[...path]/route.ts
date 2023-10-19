import { Octokit } from "octokit"
import { NextRequest, NextResponse } from "next/server"
import { accessTokenService } from "@/common/startup"

type GitHubContentItem = {download_url: string}

interface GetBlobParams {
  owner: string
  repository: string
  path: [string]
}

export async function GET(req: NextRequest, { params }: { params: GetBlobParams }) {
  const accessToken = await accessTokenService.getAccessToken()
  const octokit = new Octokit({ auth: accessToken })
  const fullPath = params.path.join("/")
  const ref = req.nextUrl.searchParams.get("ref")
  const response = await octokit.rest.repos.getContent({
    owner: params.owner,
    repo: params.repository,
    path: fullPath,
    ref: ref || undefined
  })
  let item = response.data as GitHubContentItem
  return NextResponse.redirect(new URL(item.download_url))
}
