import {
  Typography,
  Stack
} from "@mui/material"
import Link from "next/link"

interface MessageLinkFooterProps {
  url: string
  content: string
}

const MessageLinkFooter = ({
  url,
  content,
}: MessageLinkFooterProps) => {

return (
  <Stack direction="row">
    <Link href={url} target="_blank" rel="noopener">
      <Typography variant="body2" sx={{
        opacity: 0.5,
        transition: "opacity 0.3s ease",
        "&:hover": {
          opacity: 1
        }
      }}>
        {content}
      </Typography>
    </Link>
  </Stack>

  )}

export default MessageLinkFooter