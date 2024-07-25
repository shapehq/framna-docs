import Link from "next/link"
import { splitOwnerAndRepository } from "@/common"

export default async function NewProjectPage({
  repositoryNameSuffix,
  templateName
}: {
  repositoryNameSuffix: string
  templateName?: string
}) {
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
