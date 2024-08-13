import { makeNewGitHubRepositoryLink } from "@/common/utils/makeNewGitHubRepositoryLink";

test("It generates a URL with repository name and description", async () => {
  const result = makeNewGitHubRepositoryLink({
    repositoryName: "test-repo",
    description: "A test repository"
  });
  expect(result).toEqual(
    "https://github.com/new?name=test-repo&description=A%20test%20repository&visibility=private"
  );
});

test("It encodes special characters in the repository name and description", async () => {
  const result = makeNewGitHubRepositoryLink({
    repositoryName: "test repo",
    description: "A test & description"
  });
  expect(result).toEqual(
    "https://github.com/new?name=test%20repo&description=A%20test%20%26%20description&visibility=private"
  );
});

test("It generates a URL with a template repository", async () => {
  const result = makeNewGitHubRepositoryLink({
    templateName: "owner/template-repo",
    repositoryName: "test-repo",
    description: "A test repository"
  });
  expect(result).toEqual(
    "https://github.com/new?name=test-repo&description=A%20test%20repository&visibility=private&template_owner=owner&template_name=template-repo"
  );
});

test("It handles template names with special characters", async () => {
  const result = makeNewGitHubRepositoryLink({
    templateName: "owner/template repo",
    repositoryName: "test-repo",
    description: "A test repository"
  });
  expect(result).toEqual(
    "https://github.com/new?name=test-repo&description=A%20test%20repository&visibility=private&template_owner=owner&template_name=template%20repo"
  );
});

test("It returns the URL without template parameters if templateName is not provided", async () => {
  const result = makeNewGitHubRepositoryLink({
    repositoryName: "test-repo",
    description: "A test repository"
  });
  expect(result).toEqual(
    "https://github.com/new?name=test-repo&description=A%20test%20repository&visibility=private"
  );
});

test("It returns a URL even if the template name cannot be split into owner and repository", async () => {
  const result = makeNewGitHubRepositoryLink({
    templateName: "invalidTemplateName",
    repositoryName: "test-repo",
    description: "A test repository"
  });
  expect(result).toEqual(
    "https://github.com/new?name=test-repo&description=A%20test%20repository&visibility=private"
  );
});
