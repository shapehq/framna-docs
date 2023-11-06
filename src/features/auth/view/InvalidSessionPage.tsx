import { redirect } from "next/navigation"
import { sessionValidator } from "@/composition"
import InvalidSession from "./client/InvalidSession"

const {
  NEXT_PUBLIC_SHAPE_DOCS_TITLE,
  GITHUB_ORGANIZATION_NAME
} = process.env

export default async function InvalidSessionPage() {
  const isSessionValid = await sessionValidator.validateSession()
  if (isSessionValid) {
    // User ended up here by mistake so lets send them to the front page.
    redirect("/")
  }
  return (
    <InvalidSession
      siteName={NEXT_PUBLIC_SHAPE_DOCS_TITLE}
      organizationName={GITHUB_ORGANIZATION_NAME}
    />
  )
}
