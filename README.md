<p align="center">
  <img height="300" src="/logo.png">
</p>

# shape-docs

Portal displaying our projects that are documented with OpenAPI. Hosted on [docs.shapetools.io](https://docs.shapetools.io) and [staging.docs.shapetools.io](https://staging.docs.shapetools.io).

[![Build](https://github.com/shapehq/shape-docs/actions/workflows/build.yml/badge.svg)](https://github.com/shapehq/shape-docs/actions/workflows/build.yml)
[![Test](https://github.com/shapehq/shape-docs/actions/workflows/test.yml/badge.svg)](https://github.com/shapehq/shape-docs/actions/workflows/test.yml)

## 💻 Running the App Locally

Create a file named `.env.local` in the root of the project with the following contents. Make sure to replace any placeholders and generate a random secret using OpenSSL.

```
SHAPE_DOCS_BASE_URL='https://docs.shapetools.io'
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
AUTH0_BASE_URL='http://dev.local:3000'
AUTH0_ISSUER_BASE_URL='https://shape-docs-dev.eu.auth0.com'
AUTH0_CLIENT_ID='Your client ID'
AUTH0_CLIENT_SECRET='Your client secret'
AUTH0_MANAGEMENT_DOMAIN='shape-docs-dev.eu.auth0.com'
AUTH0_MANAGEMENT_CLIENT_ID='Your client ID'
AUTH0_MANAGEMENT_CLIENT_SECRET='Your client secret'
GITHUB_CLIENT_ID='GitHub App client ID'
GITHUB_CLIENT_SECRET='GitHub App client secret'
GITHUB_APP_ID='the GitHub App id'
GITHUB_PRIVATE_KEY_BASE_64='base 64 encoded version of the private key'
GITHUB_WEBHOOK_SECRET='preshared secret also put in app conf in GitHub'
GITHUB_WEBHOK_REPOSITORY_ALLOWLIST=''
GITHUB_WEBHOK_REPOSITORY_DISALLOWLIST=''
```

Each environment variable is described in the table below.

|Environment Variable|Description|
|-|-|
|SHAPE_DOCS_BASE_URL|The URL where Shape Docs is hosted.|
|AUTH0_SECRET|A long secret value used to encrypt the session cookie. Generate it using `openssl rand -hex 32`.|AUTH0_BASE_URL|The base URL of your Auth0 application. `http://dev.local:3000` during development.|
|AUTH0_ISSUER_BASE_URL|The URL of your Auth0 tenant domain.|
|AUTH0_CLIENT_ID|The client ID of your default Auth0 application.|
|AUTH0_CLIENT_SECRET|The client secret of your default Auth0 application.|
|AUTH0_MANAGEMENT_DOMAIN|The URL of your Auth0 tenant domain. It is key that this does not contain "http" or "https".|
|AUTH0_MANAGEMENT_CLIENT_ID|The client ID of your Auth0 Machine to Machine application.|
|AUTH0_MANAGEMENT_CLIENT_SECRET|The client secret of your Machine to Machine Auth0 application.|
|GITHUB_CLIENT_ID|The client ID of your GitHub app.|
|GITHUB_CLIENT_SECRET|The client secret of your GitHub app.|
|GITHUB_APP_ID|The ID of your GitHub app.|
|GITHUB_PRIVATE_KEY_BASE_64|Your GitHub app's private key encoded to base 64. Can be created using `cat my-key.pem | base64 | pbcopy`.|
|GITHUB_WEBHOOK_SECRET|Secret shared with the GitHub app to validate a webhook call.|
|GITHUB_WEBHOK_REPOSITORY_ALLOWLIST|Comma-separated list of repositories from which webhook calls should be accepted. Leave empty to accept calls from all repositories.|
|GITHUB_WEBHOK_REPOSITORY_DISALLOWLIST|Comma-separated list of repositories from which webhook calls should be ignored. The list of disallowed repositories takes precedence over the list of allowed repositories.|

You need the following two Auth0 apps.

| |Type|Description|
|-|-|-|
|Default|Generic|Used to authenticate the user when they log in.|
|Management|Machine to Machine|Used for making requests to [Auth0's Management API](https://auth0.com/docs/api/management/v2) to retrieve the access token for the identity provider that the user authorized with.|

Modify your `/etc/hosts` file to add the following entry:

```
127.0.0.1 dev.local
```

We visit our local website by opening https://dev.local:3000 instead of https://localhost:3000 as this ensures that Auth0's flow will work correctly. Auth0 does some extra checks when localhost is included in the URL and we are generally not interested in those as they give a false impression of the flow the user will see.

Run the app using the following command:

```
npm run dev
```

Finally, open the application on https://dev.local:3000.

## 🚀 Deploying the App

The app is hosted on Heroku in two different environments.

|Environment|URL|Branch|
|-|-|-|
|Staging|[staging.docs.shapetools.io](https://staging.docs.shapetools.io)|develop|
|Production|[docs.shapetools.io](https://docs.shapetools.io)|main|

Each environment is deployed by merging changes into their respective branch. Heroku is responsible for observing changes to the repository and schedule a deployment when changes are observed.

## 📖 Getting Started with Shape Docs

Details on getting started showing documentation on Shape Docs can be [found on our Conflouence](https://shapedk.atlassian.net/wiki/spaces/DEVELOPERS/pages/3795615745/Shape+Docs).
