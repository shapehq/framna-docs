import Image from "next/image"
import { Box, Link, Typography } from "@mui/material"

const Header = () => {
  const siteName = process.env.NEXT_PUBLIC_SHAPE_DOCS_TITLE
  return (
    <Box sx={{
      marginTop: 1.5,
      marginBottom: 0.5,
      paddingLeft: { xs: 2, sm: 3 },
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
          width: "max-content",
          textDecoration: "none"
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
      </Link>
    </Box>
  )
}

export default Header
