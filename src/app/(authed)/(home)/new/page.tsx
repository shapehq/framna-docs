import { env, splitOwnerAndRepository } from "@/common"
import NewProject from "@/features/new-project/NewProject";

const Page = () => {
  const repositoryNameSuffix = env.getOrThrow("REPOSITORY_NAME_SUFFIX")
  const templateName = env.get("NEW_PROJECT_TEMPLATE_REPOSITORY")
  const ownerRepository = templateName ? splitOwnerAndRepository(templateName)?.owner : undefined

return (
  <NewProject
    repositoryNameSuffix={repositoryNameSuffix}
    templateName={templateName}
    ownerRepository={ownerRepository}
  />
)}

export default Page
