import { redirect } from "next/navigation"
import { sessionValidator } from "@/composition"
import InvalidSession from "./client/InvalidSession"

export default async function InvalidSessionPage() {
  const isSessionValid = await sessionValidator.validateSession()
  if (isSessionValid) {
    // User ended up here by mistake so lets send them to the front page.
    redirect("/")
  }
  return <InvalidSession/>
}
