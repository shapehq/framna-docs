import { NextResponse } from "next/server"
import { projectDataSource } from "@/composition"

export async function GET() {
  const projects = await projectDataSource.refreshProjects()
  return NextResponse.json({ projects })
}
