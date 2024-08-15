import { Box, Typography } from "@mui/material"
import NewProjectSteps from "./view/NewProjectSteps"
import { env } from "@/common"
import MessageLinkFooter from "@/common/ui/MessageLinkFooter"

const HELP_URL = env.get("NEXT_PUBLIC_SHAPE_DOCS_HELP_URL")

interface NewProjectProps {
  repositoryNameSuffix: string
  templateName?: string
  ownerRepository?: string
}

const NewProject = ({
  repositoryNameSuffix,
  templateName,
  ownerRepository
}: NewProjectProps) => {
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
  )}

export default NewProject