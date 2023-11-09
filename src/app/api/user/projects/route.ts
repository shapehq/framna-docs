import { NextResponse } from "next/server"
import { makeAPIErrorResponse, UnauthorizedError } from "../../../../common"
import { projectDataSource } from "@/composition"

export async function GET() {
  try {
    const projects = await projectDataSource.getProjects()
    return NextResponse.json({projects})
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return makeAPIErrorResponse(401, error.message)
    } else if (error instanceof Error) {
      return makeAPIErrorResponse(500, error.message)
    } else {
      return makeAPIErrorResponse(500, "Unknown error")
    }
  }
}