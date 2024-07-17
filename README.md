<div align="center">
<img width="200" src="https://github.com/shapehq/shape-docs/raw/main/logo.png" alt="Shape Docs logo" />
</div>

<div align="center">
<h3>👋 Welcome to Shape Docs</h3>
<h4>Self-hosted web portal that collects OpenAPI documentation and facilitates spec-driven development, built with GitHub-based authorization.</h4>
</div>

<div align="center">
<a href="https://github.com/shapehq/shape-docs/actions/workflows/build.yml"><img src="https://github.com/shapehq/shape-docs/actions/workflows/build.yml/badge.svg"></a>
<a href="https://github.com/shapehq/shape-docs/actions/workflows/test.yml"><img src="https://github.com/shapehq/shape-docs/actions/workflows/test.yml/badge.svg"></a>
<a href="https://github.com/shapehq/shape-docs/actions/workflows/lint.yml"><img src="https://github.com/shapehq/shape-docs/actions/workflows/lint.yml/badge.svg"></a>
</div>

---

<div align="center">
<a href="#-getting-started">🚀 Getting Started</a>&nbsp;&nbsp;&nbsp;&nbsp;
<a href="#-how-does-it-work">👨‍🔧 How does it work?</a>&nbsp;&nbsp;&nbsp;&nbsp;
<a href="#-how-can-i-contribute">👩‍💻 How can I contribute?</a>&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://github.com/shapehq/shape-docs/wiki">📖 Wiki</a>
</div>

<hr />

Shape Docs makes managing and previewing OpenAPI documentation a breeze, streamlining spec-driven development. With GitHub-based authorization, you can easily control who accesses your docs. Shape Docs comments on pull requests that tweak your OpenAPI specs, giving you preview URLs to ensure every update is well-reviewed

<div align="center">
<img width="600" src="https://github.com/shapehq/shape-docs/raw/main/wiki/home.png?raw=true" alt="Screenshot of Shape Docs"/>
</div>

## 🚀 Getting Started

Please refer to the following articles in [the wiki](https://github.com/shapehq/shape-docs/wiki) to get started with Shape Docs.

- [Adding Documentation to Shape Docs](https://github.com/shapehq/shape-docs/wiki/Adding-Documentation-to-Shape-Docs)
- [Browsing Documentation](https://github.com/shapehq/shape-docs/wiki/Browsing-Documentation)
- [Updating Documentation](https://github.com/shapehq/shape-docs/wiki/Updating-Documentation)
- [Deploying Shape Docs](https://github.com/shapehq/shape-docs/wiki/Deploying-Shape-Docs)

## 👨‍🔧 How does it work?

Shape Docs uses [OpenAPI specifications](https://swagger.io) from GitHub repositories. Users log in with their GitHub account to access documentation for projects they have access to. A repository only needs an OpenAPI spec to be recognized by Shape Docs, but customization is possible with a .shape-docs.yml file. Here's an example:

<img width="650" src="https://github.com/shapehq/shape-docs/raw/main/wiki/example-openapi-repository-with-config.png?raw=true"/>

Shape Docs supports spec-driven development by requiring OpenAPI specs in GitHub repos, ensuring version control and peer review. When a pull request is opened, Shape Docs comments with links to preview the documentation:

<img width="760" src="https://github.com/shapehq/shape-docs/raw/main/wiki/pr-comment.png?raw=true"/>

Learn more from the [Adding Documentation](https://github.com/shapehq/shape-docs/wiki/Adding-Documentation-to-Shape-Docs), [Browsing Documentation](https://github.com/shapehq/shape-docs/wiki/Browsing-Documentation), and [Updating Documentation](https://github.com/shapehq/shape-docs/wiki/Updating-Documentation) articles in the wiki.

## 👩‍💻 How can I contribute?

Pull requests with bugfixes and new features are much appreciated. We are happy to review PRs and merge them once they are ready, as long as they contain changes that fit within the vision of Shape Docs.

Clone the repository and consult [the article on contributing](https://github.com/shapehq/shape-docs/wiki/Contributing) to get started working on the project.

```bash
git clone git@github.com:shapehq/shape-docs.git
```

## ❤️ The Product of a Shape Weekend

Every year we go on Shape Weekend, three days where all employees in Shape get together for a hackathon to build amazing products. In 2023, a team of Shape developers with a passion for documentation and spec-driven development built Shape Docs and we've used it daily ever since!

---

Shape Docks is built with ❤️ by [Shape](https://shape.dk) in Denmark. Oh, and [we are hiring](https://careers.shape.dk) 🤗
