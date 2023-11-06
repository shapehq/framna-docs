"use client"

import { Box, Button, Typography } from "@mui/material"

export default function InvalidSession() {
  const navigateToFrontPage = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/api/auth/logout"
    }
  }
  const siteName = process.env.NEXT_PUBLIC_SHAPE_DOCS_TITLE
  return (
    <Box sx={{
      display: "flex",
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 2
    }}>
      <Typography variant="h6">
        {`Your account does not have access to ${siteName}.`}
      </Typography>
      <Button variant="contained" onClick={navigateToFrontPage}>
        Log out
      </Button>
    </Box>
  )
}
