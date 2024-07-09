import Image from "next/image"
import { Box, Typography } from "@mui/material"
import Link from "next/link"

export default function SidebarHeader() {
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
          src="/duck.png"
          alt="Duck"
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
          {process.env.NEXT_PUBLIC_SHAPE_DOCS_TITLE}
        </Typography>
      </Link> 
    </Box>
  )
}
