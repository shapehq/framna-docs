import { NextResponse } from "next/server"
import { projectListDataSource } from "@/composition"

export async function GET() {
  try {
    const projects = await projectListDataSource.getProjectList()
    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Failed to fetch project list:", error)
    return NextResponse.json(
      { error: "Failed to fetch project list" },
      { status: 500 }
    )
  }
}
