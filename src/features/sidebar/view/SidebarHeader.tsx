import Image from "next/image"
import { Box, Typography, IconButton, Tooltip } from "@mui/material"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"

export default function SidebarHeader() {
  const siteName = process.env.NEXT_PUBLIC_SHAPE_DOCS_TITLE
  const projectWikiURL = process.env.NEXT_PUBLIC_SHAPE_DOCS_PROJECT_WIKI_URL || ""

  return (
    <Box sx={{ padding: 2, height: 80, marginBottom: 2, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
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
      <Tooltip title="Add new project">
        <Link href={`${projectWikiURL}`} target="_blank">
          <IconButton color="primary" size="small" aria-label="Add new project">
            <FontAwesomeIcon icon={faPlus} size="xs" style={{ aspectRatio: 1, padding: 2 }} />
          </IconButton>
        </Link>
      </Tooltip>
    </Box>
  )
}
