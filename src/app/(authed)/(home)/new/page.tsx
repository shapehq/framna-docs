import { Box, Typography } from "@mui/material"
import { env, splitOwnerAndRepository } from "@/common"
import MessageLinkFooter from "@/common/ui/MessageLinkFooter"
import dynamic from 'next/dynamic'

const HELP_URL = env.get("FRAMNA_DOCS_HELP_URL")

const NewProjectSteps = dynamic(() => import("@/features/new-project/view/NewProjectSteps"))

const Page = () => {
  const repositoryNameSuffix = env.getOrThrow("REPOSITORY_NAME_SUFFIX")
  const templateName = env.get("NEW_PROJECT_TEMPLATE_REPOSITORY")
  const ownerRepository = templateName ? splitOwnerAndRepository(templateName)?.owner : undefined
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      height={1}
      width={1}
      gap={6}
    >
      <Typography variant="h4">
        Add a new project
      </Typography>
      <NewProjectSteps 
        repositoryNameSuffix={repositoryNameSuffix}
        templateName={templateName}
        ownerRepository={ownerRepository}
      />
      {HELP_URL && 
        <MessageLinkFooter
          url={HELP_URL}
          content="Need help? Explore our wiki for more info."
        />
      }
    </Box>
  )
}

export default Page
