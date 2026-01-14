# Framna Docs CLI

CLI tool for interacting with Framna Docs - your OpenAPI documentation portal.

## Installation

```bash
npx @framna-docs/cli
```

Or install globally:

```bash
npm install -g @framna-docs/cli
```

## Authentication

```bash
# Login via GitHub device flow
framna-docs auth login

# Check auth status
framna-docs auth status

# Logout
framna-docs auth logout
```

## Usage

### Projects

```bash
# List all projects
framna-docs projects

# Get project details
framna-docs project <name>
```

### Endpoints

```bash
# List endpoints
framna-docs endpoints <project> [--version X] [--spec Y]

# Search endpoints
framna-docs endpoints search <project> <query>

# Get endpoint details
framna-docs endpoint <project> <path> <method>
```

### Schemas

```bash
# List schemas
framna-docs schemas <project>

# Get schema definition
framna-docs schema <project> <name>
```

## MCP Integration

Add to Claude Code:

```bash
claude mcp add framna-docs -- npx @framna-docs/cli mcp serve
```

The MCP server exposes these tools:
- `list_projects` - List all projects
- `get_project` - Get project details
- `list_endpoints` - List API endpoints
- `search_endpoints` - Search endpoints
- `get_endpoint_details` - Get endpoint details
- `list_schemas` - List schemas
- `get_schema` - Get schema definition

## Configuration

Set `FRAMNA_DOCS_URL` environment variable to use a custom server:

```bash
export FRAMNA_DOCS_URL=https://your-server.com
```

Session is stored in `~/.framna-docs/session.json`.
