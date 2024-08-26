import Image from "next/image"
import { Link, Box } from "@mui/material"

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
        sx={{
          alignItems: "center",
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
      </Link>
    </Box>
  )
}

export default Header
