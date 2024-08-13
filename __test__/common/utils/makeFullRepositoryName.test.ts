import { makeFullRepositoryName } from "@/common/utils/makeFullRepositoryName";

test("It returns a sanitized repository name with a suffix", async () => {
  const result = makeFullRepositoryName({ name: "My Project", suffix: "-repo" });
  expect(result).toEqual("myproject-repo");
});

test("It returns a lowercase repository name", async () => {
  const result = makeFullRepositoryName({ name: "MyProject", suffix: "-repo" });
  expect(result).toEqual("myproject-repo");
});

test("It trims spaces from the name", async () => {
  const result = makeFullRepositoryName({ name: "  My Project  ", suffix: "-repo" });
  expect(result).toEqual("myproject-repo");
});

test("It removes non-alphanumeric characters except dashes", async () => {
  const result = makeFullRepositoryName({ name: "My!@#Pro$%^ject", suffix: "-repo" });
  expect(result).toEqual("myproject-repo");
});

test("It replaces spaces with dashes", async () => {
  const result = makeFullRepositoryName({ name: "My Project", suffix: "-repo" });
  expect(result).toEqual("myproject-repo");
});

test("It handles names with multiple spaces correctly", async () => {
  const result = makeFullRepositoryName({ name: "My    Project", suffix: "-repo" });
  expect(result).toEqual("myproject-repo");
});

test("It handles names with no characters left after sanitization", async () => {
  const result = makeFullRepositoryName({ name: "!@#$%^", suffix: "-repo" });
  expect(result).toEqual("-repo");
});

test("It handles names that are already safe", async () => {
  const result = makeFullRepositoryName({ name: "safe-project-name", suffix: "-repo" });
  expect(result).toEqual("safe-project-name-repo");
});

test("It returns just the suffix if the name is an empty string", async () => {
  const result = makeFullRepositoryName({ name: "", suffix: "-repo" });
  expect(result).toEqual("-repo");
});

test("It handles a suffix with special characters correctly", async () => {
  const result = makeFullRepositoryName({ name: "My Project", suffix: "!-repo" });
  expect(result).toEqual("myproject!-repo");
});
