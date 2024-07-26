import Link from "next/link"
import { env, splitOwnerAndRepository } from "@/common"

const Page = () => {
  const repositoryNameSuffix = env.getOrThrow("REPOSITORY_NAME_SUFFIX")
  const templateName = env.get("NEW_PROJECT_TEMPLATE_REPOSITORY")
  const projectName = "Nordisk Film"
  const suffixedRepositoryName = makeFullRepositoryName({
    name: projectName,
    suffix: repositoryNameSuffix
  })
  const newGitHubRepositoryLink = makeNewGitHubRepositoryLink({
    templateName,
    repositoryName: suffixedRepositoryName,
    description: `Contains OpenAPI specifications for ${projectName}`
  })
  return (
    <Link href={newGitHubRepositoryLink}>
      {newGitHubRepositoryLink}
    </Link>
  )
}

export default Page

function makeFullRepositoryName({ name, suffix }: { name: string, suffix: string }) {
  const safeRepositoryName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/\s+/g, "-")
  return `${safeRepositoryName}${suffix}`
}

function makeNewGitHubRepositoryLink({
  templateName,
  repositoryName,
  description
}: {
  templateName?: string,
  repositoryName: string,
  description: string
}) {
  let url = `https://github.com/new`
    + `?name=${encodeURIComponent(repositoryName)}`
    + `&description=${encodeURIComponent(description)}`
    + `&visibility=private`
  if (templateName) {
    const templateRepository = splitOwnerAndRepository(templateName)
    if (templateRepository) {
      url += `&template_owner=${encodeURIComponent(templateRepository.owner)}`
      url += `&template_name=${encodeURIComponent(templateRepository.repository)}`
    }
  }
  return url
}
