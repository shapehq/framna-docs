import { env, splitOwnerAndRepository } from "@/common"
import { Box } from "@mui/material"
import NewProject from "@/features/new-project/NewProject";

const Page = () => {
  const repositoryNameSuffix = env.getOrThrow("REPOSITORY_NAME_SUFFIX")
  const templateName = env.get("NEW_PROJECT_TEMPLATE_REPOSITORY")
  const ownerRepository = templateName ? splitOwnerAndRepository(templateName)?.owner : undefined

return (
    <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
      <NewProject
        repositoryNameSuffix={repositoryNameSuffix}
        templateName={templateName}
        ownerRepository={ownerRepository}
      />
    </Box>
  )}

export default Page
