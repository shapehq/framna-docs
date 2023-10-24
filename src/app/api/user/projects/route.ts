import { NextResponse } from "next/server"
import { projectDataSource } from "@/composition"
import { UnauthorizedError } from "@/features/auth/domain/AuthError"

export async function GET() {
  try {
    const projects = await projectDataSource.getProjects()
    return NextResponse.json({projects})
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({
        status: 401,
        message: error.message
      }, { status: 401 })
    } else if (error instanceof Error) {
      return NextResponse.json({
        status: 500,
        message: error.message
      }, { status: 500 })
    } else {
      return NextResponse.json({
        status: 500,
        message: "Unknown error"
      }, { status: 500 })
    }
  }
}
