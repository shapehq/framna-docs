import { NextResponse } from "next/server"
import { projectDataSource } from "@/composition"
import { UnauthorizedError, InvalidSessionError } from "../../../../common"

export async function GET() {
  try {
    const projects = await projectDataSource.getProjects()
    return NextResponse.json({projects})
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(401, error.message)
    } else if (error instanceof InvalidSessionError) {
      return errorResponse(403, error.message)
    } else if (error instanceof Error) {
      return errorResponse(500, error.message)
    } else {
      return errorResponse(500, "Unknown error")
    }
  }
}

function errorResponse(status: number, message: string): NextResponse {
  return NextResponse.json({ status, message }, { status })
}
