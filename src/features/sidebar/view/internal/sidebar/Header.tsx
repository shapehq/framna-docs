"use client"

import Image from "next/image"
import { Box, Button, Typography } from "@mui/material"
import { useRouter } from "next/navigation"
import { useCloseSidebarOnSelection } from "@/features/sidebar/data"

const Header = () => {
  const siteName = process.env.NEXT_PUBLIC_SHAPE_DOCS_TITLE
  const router = useRouter()
  const { closeSidebarIfNeeded } = useCloseSidebarOnSelection()
  return (
    <Box sx={{
      marginTop: 1.5,
      marginBottom: 0.5,
      paddingLeft: 2.1,
      minHeight: 64,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <Button
        sx={{
          display: "flex",
          padding: 0,
          gap: "6px",
          "&:hover": {
            backgroundColor: "transparent"
          }
        }}
        onClick={() => {
          closeSidebarIfNeeded()
          router.push("/")
        }}
      >
        <Image
          src="/images/logo.png"
          alt={`${siteName} logo`}
          width={40}
          height={45}
          priority={true}
        />
        <Typography variant="h6">
          {siteName}
        </Typography>
      </Button>
    </Box>
  )
}

export default Header
