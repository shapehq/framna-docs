import Image from "next/image"
import { Box, Stack, Typography } from "@mui/material"
import { env } from "@/common"
import SignInTexts from "@/features/auth/view/SignInTexts"
import MessageLinkFooter from "@/common/ui/MessageLinkFooter"
import SignInButton from "./SignInButton"

const SITE_NAME = env.getOrThrow("FRAMNA_DOCS_TITLE")
const HELP_URL = env.get("FRAMNA_DOCS_HELP_URL")
const PROJECT_SOURCE_PROVIDER = env.get("PROJECT_SOURCE_PROVIDER") || "github"

// Force page to be rendered dynamically to ensure we read the correct values for the environment variables.
export const dynamic = "force-dynamic"

export default async function Page() {
  const isAzureDevOps = PROJECT_SOURCE_PROVIDER === "azure-devops"
  const providerId = isAzureDevOps ? "microsoft-entra-id" : "github"

  return (
    <Box display="flex" height="100vh">
      <InfoColumn />
      <SignInColumn
        providerId={providerId}
      />
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

interface SignInColumnProps {
  providerId: string
}

const SignInColumn = ({ providerId }: SignInColumnProps) => {
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
          <SignInButton providerId={providerId} />
        </Stack>
      </Box>
      {HELP_URL && (
        <Box sx={{ marginBottom: 2 }}>
          <MessageLinkFooter
            url={HELP_URL}
            content={`Learn more about ${SITE_NAME}`}
          />
        </Box>
      )}
    </Box>
  )
}
