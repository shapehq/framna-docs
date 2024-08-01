/**
 * Constructs a safe and standardized GitHub repository name with a given suffix.
 * 
 * This function takes a project name and a suffix, sanitizes the project name by
 * removing any non-alphanumeric characters (except dashes) and spaces, and then
 * concatenates it with the provided suffix to form a standardized repository name.
 * 
 * @param {Object} params - The parameters for generating the full repository name.
 * @param {string} params.name - The base name of the repository.
 * @param {string} params.suffix - The suffix to append to the sanitized repository name.
 * 
 * @returns {string} - A sanitized and standardized repository name with the provided suffix.
 */

export function makeFullRepositoryName({ name, suffix }: { name: string, suffix: string }) {
  const safeRepositoryName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/\s+/g, "-")
  return `${safeRepositoryName}${suffix}`
}