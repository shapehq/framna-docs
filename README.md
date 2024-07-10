<p align="center">
  <img height="300" src="/logo.png">
</p>

# shape-docs

Portal displaying our projects that are documented with OpenAPI. Hosted on [docs.shapetools.io](https://docs.shapetools.io) and [staging.docs.shapetools.io](https://staging.docs.shapetools.io).

[![Build](https://github.com/shapehq/shape-docs/actions/workflows/build.yml/badge.svg)](https://github.com/shapehq/shape-docs/actions/workflows/build.yml)
[![Test](https://github.com/shapehq/shape-docs/actions/workflows/test.yml/badge.svg)](https://github.com/shapehq/shape-docs/actions/workflows/test.yml)
[![Lint](https://github.com/shapehq/shape-docs/actions/workflows/lint.yml/badge.svg)](https://github.com/shapehq/shape-docs/actions/workflows/lint.yml)

## 💻 Running the App Locally

Copy `.env.example` to `.env.local` in the root of the project. Make sure to replace any placeholders and generate a random secret using OpenSSL.

The table below contains explanations for environment variables. The list is not preemptive and `.env.example` contains the full list.

|Environment Variable|Description|
|-|-|
|NEXT_PUBLIC_SHAPE_DOCS_TITLE|Title of the portal. Displayed to the user in the browser.|
|SHAPE_DOCS_BASE_URL|The URL where Shape Docs is hosted.|
|NEXTAUTH_URL|The URL where Shape Docs is hosted.|
|NEXTAUTH_SECRET|A long secret value used to encrypt the session cookie. Generate it using `openssl rand -base64 32`.|
|GITHUB_CLIENT_ID|The client ID of your GitHub app.|
|GITHUB_CLIENT_SECRET|The client secret of your GitHub app.|
|GITHUB_APP_ID|The ID of your GitHub app.|
|GITHUB_PRIVATE_KEY_BASE_64|Your GitHub app's private key encoded to base 64. Can be created using `cat my-key.pem | base64 | pbcopy`.|
|GITHUB_WEBHOOK_SECRET|Secret shared with the GitHub app to validate a webhook call.|
|GITHUB_WEBHOK_REPOSITORY_ALLOWLIST|Comma-separated list of repositories from which webhook calls should be accepted. Leave empty to accept calls from all repositories.|
|GITHUB_WEBHOK_REPOSITORY_DISALLOWLIST|Comma-separated list of repositories from which webhook calls should be ignored. The list of disallowed repositories takes precedence over the list of allowed repositories.|
|REDIS_URL|The URL to the Redis store.|

Be aware that the GitHub private key must be PKCS8. GitHub creates PKCS1 keys, so we must manually convert the key from PKCS1 to PKCS8 before base64 encoding it. This can be done as follows:

```bash
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt \
  -in private-key-pkcs1.pem \
  -out private-key-pkcs8.pem
```

The key can then be base 64 encoded and assigned to the GITHUB_PRIVATE_KEY_BASE_64 environment variable as follows:

```bash
base64 -i ~/Downloads/private-key-pkcs8.pem | pbcopy
```

Run the app using the following command:

```
npm run dev
```

Finally, open the application on https://dev.local:3000.

## Database Schemas

See `create-tables.sql`

## 🚀 Deploying the App

The app is hosted on Heroku in two different environments.

|Environment|URL|Branch|
|-|-|-|
|Staging|[staging.docs.shapetools.io](https://staging.docs.shapetools.io)|develop|
|Production|[docs.shapetools.io](https://docs.shapetools.io)|main|

Each environment is deployed by merging changes into their respective branch. Heroku is responsible for observing changes to the repository and schedule a deployment when changes are observed.

## 📖 Getting Started with Shape Docs

Details on getting started showing documentation on Shape Docs can be [found on our Confluence](https://shapedk.atlassian.net/wiki/spaces/DEVELOPERS/pages/3795615745/Shape+Docs).
