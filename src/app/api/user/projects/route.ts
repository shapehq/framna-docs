import { NextRequest, NextResponse } from "next/server"
import { projectRepository } from "@/common/startup"

export async function GET(_req: NextRequest) {
  const projects = await projectRepository.getProjects()
  return NextResponse.json({projects})
}
