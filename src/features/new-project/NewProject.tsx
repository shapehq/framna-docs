import {
  Box,
} from "@mui/material"
import NewProjectSteps from "./view/NewProjectSteps"
import { env } from "@/common"
import MessageLinkFooter from "@/common/ui/MessageLinkFooter"
import HighlightText from "@/common/ui/HighlightText"
import { BASE_COLORS } from "@/common/theme/theme"

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
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      height={1}
      width={1}
      gap={6}
    >
      <HighlightText
        content={`${title} ${SITE_NAME}`}
        highlight={SITE_NAME}
        color={BASE_COLORS[0]}
        variant="h4"
        isSolidOpacity
      />
      <NewProjectSteps 
        repositoryNameSuffix={repositoryNameSuffix}
        templateName={templateName}
        ownerRepository={ownerRepository}
      />
      {HELP_URL && 
        <MessageLinkFooter
          url={HELP_URL}
          content="Need help? Explore our wiki for more info"
        />
      }
    </Box>
  )}

export default NewProject