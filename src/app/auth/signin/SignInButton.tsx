"use client"

import { signIn } from "next-auth/react"
import { Button, Stack, Typography } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub, faMicrosoft } from "@fortawesome/free-brands-svg-icons"

interface SignInButtonProps {
  providerId: string
}

export default function SignInButton({ providerId }: SignInButtonProps) {
  const providerIcon = providerId === "microsoft-entra-id" ? faMicrosoft : faGithub
  const providerName = providerId === "microsoft-entra-id" ? "Microsoft" : "GitHub"

  return (
    <Button
      variant="outlined"
      onClick={() => signIn(providerId, { callbackUrl: "/" })}
    >
      <Stack direction="row" alignItems="center" spacing={1} padding={1}>
        <FontAwesomeIcon icon={providerIcon} size="2xl" />
        <Typography variant="h6" sx={{ display: "flex" }}>
          Sign in with {providerName}
        </Typography>
      </Stack>
    </Button>
  )
}
