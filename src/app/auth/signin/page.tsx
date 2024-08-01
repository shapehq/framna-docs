import Image from "next/image"
import Link from "next/link"
import { Box, Button, Stack, Typography } from "@mui/material"
import { signIn } from "@/composition"
import { env } from "@/common"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import SignInTexts from "@/features/auth/view/SignInTexts"

const SITE_NAME = env.getOrThrow("NEXT_PUBLIC_SHAPE_DOCS_TITLE")
const HELP_URL = env.get("NEXT_PUBLIC_SHAPE_DOCS_HELP_URL")
 
export default async function SignInPage() {
  return (
    <Box display="flex" height="100vh">
      <InfoColumn/>
      <SignInColumn/>
    </Box>
  )
}

const InfoColumn = () => {
  return (
    <Box
      flex={1}
      sx={{ display: { xs: "none", sm: "none", md: "flex" } }}
      alignItems="center"
      bgcolor="#000"
      color="#fff"
    >
      <SignInTexts prefix={SITE_NAME} />
    </Box>
  )
}

const SignInColumn = () => {
  const title = `Get started with ${SITE_NAME}`
  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      bgcolor="#fff"
    >
      <Box display="flex" flex={1} justifyContent="center" alignItems="center">
        <Stack direction="column" sx={{
          alignItems: { xs: "center", sm: "center", md: "flex-start" },
          padding: 4
        }}>
          <Box sx={{ marginBottom: 8 }}>
            <Image
              src="/images/logo.png"
              alt={`${SITE_NAME} logo`}
              width={150}
              height={171}
              priority={true}
            />
          </Box>
          <Typography variant="h6" sx={{
            display: { xs: "flex", sm: "flex", md: "none" },
            marginBottom: 3,
            textAlign: "center"
          }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{
            display: { xs: "none", sm: "none", md: "flex" },
            marginBottom: 3
          }}>
            {title}
          </Typography>
          <SignInWithGitHub />
        </Stack>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Footer/>
      </Box>
    </Box>
  )
}

const SignInWithGitHub = () => {
  return (
    <form
      action={async () => {
        "use server"
          await signIn("github", { redirectTo: "/" })
      }}
    >
      <Button variant="outlined" type="submit">
        <Stack direction="row" alignItems="center" spacing={1} padding={1}>
          <FontAwesomeIcon icon={faGithub} size="2xl" />
            <Typography variant="h6" sx={{ display: "flex" }}>
              Sign in with GitHub
            </Typography>
        </Stack>
      </Button>
    </form>
  )
}

const Footer = () => {
  return (
    <Stack direction="row">
      {HELP_URL && 
        <Link href={HELP_URL} target="_blank" rel="noopener">
          <Typography variant="body2" sx={{
            opacity: 0.5,
            transition: "opacity 0.3s ease",
            "&:hover": {
              opacity: 1
            }
          }}>
            Learn more about {SITE_NAME}
          </Typography>
        </Link>
      }
    </Stack>
  )
}