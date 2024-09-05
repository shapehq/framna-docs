/**
 * Generates a URL to create a new GitHub repository using an optional template repository.
 * 
 * This function constructs a URL that directs to GitHub's new repository creation page. 
 * It supports creating a repository with a specific name, description, and optional template repository.
 * 
 * @param {Object} params - The parameters for generating the GitHub repository URL.
 * @param {string} [params.templateName] - The name of the template repository to use (optional).
 * @param {string} params.repositoryName - The name for the new repository.
 * @param {string} params.description - The description for the new repository.
 * 
 * @returns {string} - A URL string that directs to the GitHub new repository creation page with the provided parameters.
 */

import { splitOwnerAndRepository } from "@/common"

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
