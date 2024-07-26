import Image from "next/image"
import Link from "next/link"
import { Box, Typography, IconButton, Tooltip } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"

const Header = () => {
  const siteName = process.env.NEXT_PUBLIC_SHAPE_DOCS_TITLE
  return (
    <Box sx={{
      padding: 2,
      height: 80,
      marginBottom: 2,
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
      <Tooltip title="New Project">
        <Link href="/new">
          <IconButton color="primary" size="small" aria-label="New Project">
            <FontAwesomeIcon icon={faPlus} size="xs" style={{ aspectRatio: 1, padding: 2 }} />
          </IconButton>
        </Link>
      </Tooltip>
    </Box>
  )
}

export default Header
