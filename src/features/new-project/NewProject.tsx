import {
  Box,
  Typography,
} from "@mui/material"
import NewProjectSteps from "./view/NewProjectSteps"
import { env } from "@/common"
import MessageLinkFooter from "@/common/ui/MessageLinkFooter"

const SITE_NAME = env.getOrThrow("NEXT_PUBLIC_SHAPE_DOCS_TITLE")
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
  const title = "Add a new project to "

return (
    <Box display="flex" alignItems="start" justifyContent="center" flexDirection="column" height="100vh" gap={6}>
      <Typography variant="h4" sx={{
        display: { xs: "none", sm: "none", md: "flex" },
      }}>
        {title}
        {SITE_NAME}
      </Typography>
      <NewProjectSteps 
        repositoryNameSuffix={repositoryNameSuffix}
        templateName={templateName}
        ownerRepository={ownerRepository}
        helpURL={HELP_URL}
      />
      {HELP_URL && 
        <MessageLinkFooter 
          url={HELP_URL}
          content={`Read more about Adding Documentation to ${SITE_NAME}`}
        />
      }
    </Box>
  )}

export default NewProject