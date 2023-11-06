"use client"

import { Button, Stack, Typography } from "@mui/material"

export default function InvalidSession({
  siteName,
  organizationName
}: {
  siteName: string
  organizationName: string
}) {
  const navigateToFrontPage = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/api/auth/logout"
    }
  }
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ width: "100%", height: "100%" }}>
      <Stack direction="column" spacing={3} alignItems="center" sx={{ margin: 2, maxWidth: "500px" }}>
        <Typography variant="h6" align="center">
          Your account does not have access to {siteName}
        </Typography>
        <Typography align="center">
          Access to {siteName} requires that your account is an active member of the <strong>{organizationName}</strong> organization on GitHub.
        </Typography>
        <Button variant="contained" onClick={navigateToFrontPage}>
          Log out
        </Button>
      </Stack>
    </Stack>
  )
}
