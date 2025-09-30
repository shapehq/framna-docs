import { NextResponse } from "next/server";
import { projectDataSource } from "@/composition";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shouldRefresh = searchParams.get("refresh") === "true";
  const projects = shouldRefresh
    ? await projectDataSource.refreshProjects()
    : await projectDataSource.getProjects();
  return NextResponse.json({ projects });}