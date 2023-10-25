import { NextRequest, NextResponse } from "next/server"
import { gitHubClient } from "@/composition"

interface GetBlobParams {
  owner: string
  repository: string
  path: [string]
}

export async function GET(req: NextRequest, { params }: { params: GetBlobParams }) {
  const path = params.path.join("/")
  const item = await gitHubClient.getRepositoryContent({
    repositoryOwner: params.owner,
    repositoryName: params.repository,
    path: path,
    ref: req.nextUrl.searchParams.get("ref") ?? undefined
  })
  const url = new URL(item.downloadURL)
  const imageRegex = /\.(jpg|jpeg|png|webp|avif|gif)$/;

  if (new RegExp(imageRegex).exec(path)) {
    const file = await fetch(url).then(r => r.blob());
    const headers = new Headers();
    const cacheExpirationInSeconds = 60 * 60 * 24 * 30; // 30 days
  
    headers.set("Content-Type", "image/*");
    headers.set("cache-control", `stale-while-revalidate=${cacheExpirationInSeconds}`);

    return new NextResponse(file, { status: 200, statusText: "OK", headers })
  } else {
    return NextResponse.redirect(url)
  }
}
