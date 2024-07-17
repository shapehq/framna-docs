import Image from "next/image"
import { Box, Typography } from "@mui/material"
import Link from "next/link"

export default function SidebarHeader() {
  const siteName = process.env.NEXT_PUBLIC_SHAPE_DOCS_TITLE
  return (
    <Box sx={{ padding: 2, paddingBottom: 4 }}>
      <Link
        href={"/"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          width: "max-content"
        }}
      >
        <Image
          src="/images/logo.png"
          alt={`${siteName} logo`}
          width={40}
          height={45}
          priority={true}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: 1
          }}
        >
          {siteName}
        </Typography>
      </Link> 
    </Box>
  )
}
