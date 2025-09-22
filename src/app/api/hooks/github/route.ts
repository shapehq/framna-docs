import { NextRequest, NextResponse } from "next/server";
import { gitHubHookHandler } from "@/composition";
import { revalidatePath } from "next/cache";
import { projectDataSource } from "@/composition";

// I GitHubHookHandler eller composition
export const POST = async (req: NextRequest) => {
  await gitHubHookHandler.handle(req);

  // Opdater projects cache når webhook modtages
  await projectDataSource.refreshProjects();

  revalidatePath("/(authed)/projects");
  return NextResponse.json({ status: "OK" });
};
