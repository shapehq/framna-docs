import { Button } from "@mui/material"
import { signIn } from "next-auth/react"

export default async function Page() {
  return (
    <Button onClick={() => signIn("github")}>
      Sign In
    </Button>
  )
}
