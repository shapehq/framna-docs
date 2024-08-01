import { splitOwnerAndRepository } from "@/common"

export function makeFullRepositoryName({ name, suffix }: { name: string, suffix: string }) {
  const safeRepositoryName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/\s+/g, "-")
  return `${safeRepositoryName}${suffix}`
}

export function makeNewGitHubRepositoryLink({
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
