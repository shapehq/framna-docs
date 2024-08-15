import Image from "next/image"
import Link from "next/link"
import { Box, Typography } from "@mui/material"

const Header = () => {
  const siteName = process.env.NEXT_PUBLIC_SHAPE_DOCS_TITLE
  return (
    <Box sx={{
      marginTop: 2,
      paddingLeft: 3,
      minHeight: 64,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
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

export default Header
