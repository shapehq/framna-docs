import { NextResponse } from "next/server"
import { projectDataSource, sessionProjectRepository } from "@/composition"

export async function GET() {
  const projects = await projectDataSource.getProjects()
  await sessionProjectRepository.storeProjects(projects)
  return NextResponse.json({projects})
}
