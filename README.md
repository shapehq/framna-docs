<div align="center">
<img width="200" src="https://github.com/shapehq/framna-docs/raw/main/logo.png" alt="Framna Docs logo" />
</div>

<div align="center">
<h3>👋 Welcome to Framna Docs</h3>
<h4>Self-hosted web portal that centralizes OpenAPI documentation and facilitates spec-driven development, with support for GitHub and Azure DevOps.</h4>
</div>

<div align="center">
<a href="https://github.com/shapehq/framna-docs/actions/workflows/build.yml"><img src="https://github.com/shapehq/framna-docs/actions/workflows/build.yml/badge.svg"></a>
<a href="https://github.com/shapehq/framna-docs/actions/workflows/run-unit-tests.yml"><img src="https://github.com/shapehq/framna-docs/actions/workflows/run-unit-tests.yml/badge.svg"></a>
<a href="https://github.com/shapehq/framna-docs/actions/workflows/test-sql-queries.yml"><img src="https://github.com/shapehq/framna-docs/actions/workflows/test-sql-queries.yml/badge.svg"></a>
<a href="https://github.com/shapehq/framna-docs/actions/workflows/lint.yml"><img src="https://github.com/shapehq/framna-docs/actions/workflows/lint.yml/badge.svg"></a>
<a href="https://github.com/shapehq/framna-docs/actions/workflows/build-docker-image"><img src="https://github.com/shapehq/framna-docs/actions/workflows/build-docker-image.yml/badge.svg"></a>
</div>

---

<div align="center">
<a href="#-getting-started">🚀 Getting Started</a>&nbsp;&nbsp;&nbsp;&nbsp;
<a href="#-how-does-it-work">👨‍🔧 How does it work?</a>&nbsp;&nbsp;&nbsp;&nbsp;
<a href="#-how-can-i-contribute">👩‍💻 How can I contribute?</a>&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://github.com/shapehq/framna-docs/wiki">📖 Wiki</a>
</div>

<hr />

Framna Docs makes managing and previewing OpenAPI documentation a breeze, streamlining spec-driven development. With GitHub-based authorization, you can easily control who accesses your docs. Framna Docs comments on pull requests that tweak your OpenAPI specs, giving you preview URLs to ensure every update is well-reviewed.

<div align="center">
<img width="600" src="https://github.com/shapehq/framna-docs/raw/main/wiki/home.png?raw=true" alt="Screenshot of Framna Docs"/>
</div>

## 🚀 Getting Started

Please refer to the following articles in [the wiki](https://github.com/shapehq/framna-docs/wiki) to get started with Framna Docs.

- [Adding Documentation to Framna Docs](https://github.com/shapehq/framna-docs/wiki/Adding-Documentation-to-Framna-Docs)
- [Browsing Documentation](https://github.com/shapehq/framna-docs/wiki/Browsing-Documentation)
- [Updating Documentation](https://github.com/shapehq/framna-docs/wiki/Updating-Documentation)
- [Deploying Framna Docs](https://github.com/shapehq/framna-docs/wiki/Deploying-Framna-Docs)

### Install the OpenAPI diff tool locally

Framna Docs relies on the [`oasdiff`](https://github.com/oasdiff/oasdiff) CLI when comparing specifications.  

On MacOS you can install with homebrew:

```bash
brew tap oasdiff/homebrew-oasdiff
brew install oasdiff
```

## 👨‍🔧 How does it work?

Framna Docs uses [OpenAPI specifications](https://swagger.io) from GitHub or Azure DevOps repositories. Users log in with their GitHub or Microsoft Entra ID account (depending on the configured provider) to access documentation for projects they have access to. A repository only needs an OpenAPI spec to be recognized by Framna Docs, but customization is possible with a .framna-docs.yml file. Here's an example:

<img width="650" src="https://github.com/shapehq/framna-docs/raw/main/wiki/example-openapi-repository-with-config.png?raw=true"/>

Framna Docs supports spec-driven development by requiring OpenAPI specs in version-controlled repositories, ensuring peer review. When using GitHub, Framna Docs comments on pull requests with links to preview the documentation:

<img width="760" src="https://github.com/shapehq/framna-docs/raw/main/wiki/pr-comment.png?raw=true"/>

Learn more from the [Adding Documentation](https://github.com/shapehq/framna-docs/wiki/Adding-Documentation-to-Framna-Docs), [Browsing Documentation](https://github.com/shapehq/framna-docs/wiki/Browsing-Documentation), and [Updating Documentation](https://github.com/shapehq/framna-docs/wiki/Updating-Documentation) articles in the wiki.

### Provider Configuration

Framna Docs supports two project source providers: **GitHub** (default) and **Azure DevOps**. Set the `PROJECT_SOURCE_PROVIDER` environment variable to choose your provider.

#### GitHub (default)

```bash
PROJECT_SOURCE_PROVIDER=github
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_APP_ID=...
GITHUB_PRIVATE_KEY_BASE_64=...
```

#### Azure DevOps

Azure DevOps uses Microsoft Entra ID (formerly Azure AD) for authentication:

```bash
PROJECT_SOURCE_PROVIDER=azure-devops
AZURE_ENTRA_ID_CLIENT_ID=...
AZURE_ENTRA_ID_CLIENT_SECRET=...
AZURE_ENTRA_ID_TENANT_ID=...
AZURE_DEVOPS_ORGANIZATION=your-organization
```

See `.env.example` for a full list of configuration options.

## 👩‍💻 How can I contribute?

Pull requests with bugfixes and new features are much appreciated. We are happy to review PRs and merge them once they are ready, as long as they contain changes that fit within the vision of Framna Docs.

Clone the repository and consult the articles on [running Framna Docs locally](https://github.com/shapehq/framna-docs/wiki/Running-Framna-Docs-Locally) and [contributing](https://github.com/shapehq/framna-docs/wiki/Contributing) to get started contributing changes the project.

```bash
git clone git@github.com:shapehq/framna-docs.git
```

### 🔀 Git Workflow

Two following long-lived branches exist:

* **main**: Stable/release branch meant for deployment to the production environment.
* **develop**: Branch meant for deployment to a staging environment.

**Do's 👍**

- Features are branched off from `develop` and merged back in using a PR when ready. Rebase or merge `develop` in to keep the feature branch up to date. Squash merge the feature branch into `develop`.
- `develop` is merged into `main` whenever a new release is made. Only regular merge commits are allowed in this case. You do not need to bring develop up to date with `main` before merging.
- A hotfix is applied by branching out from `main`. The hotfix branch _must_ be merged into both `main` and `develop`.

**Don'ts 🙅‍♂️**

- Never squash merge `develop` into `main`.

## ❤️ The Product of a Shape Weekend

Before we became Framna, our company was known as Shape. Every year, we held "Shape Weekend", a three-day hackathon where all employees came together to build exciting new products. In 2023, one of those teams, passionate about documentation and spec-driven development, built Framna Docs. We have used it daily ever since.

---

Framna Docs is built with ❤️ by [Framna](https://framna.com/) in Denmark. Oh, and [we are hiring](https://framna.com/careers) 🤗
