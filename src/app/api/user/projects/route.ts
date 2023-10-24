import { NextResponse } from "next/server"
import { projectRepository } from "@/composition"

export async function GET() {
  const projects = await projectRepository.getProjects()
  return NextResponse.json({projects})
}
