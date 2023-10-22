import { NextResponse } from "next/server"
import { projectRepository } from "@/common/startup"

export async function GET() {
  const projects = await projectRepository.getProjects()
  return NextResponse.json({projects})
}
