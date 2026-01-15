#!/usr/bin/env node

import { Command } from "commander"
import { createAuthCommand } from "./commands/auth/index.js"
import {
  createProjectsCommand,
  createProjectCommand,
} from "./commands/projects.js"
import {
  createEndpointsCommand,
  createEndpointsSearchCommand,
  createEndpointCommand,
} from "./commands/endpoints.js"
import { createSchemasCommand, createSchemaCommand } from "./commands/schemas.js"
import { createSpecCommand } from "./commands/spec.js"
import { createMCPCommand } from "./commands/mcp.js"
import { createCacheCommand } from "./commands/cache.js"

const program = new Command()

program
  .name("framna-docs")
  .description("CLI for Framna Docs - OpenAPI documentation portal")
  .version("0.1.0")

// Auth commands
program.addCommand(createAuthCommand())

// Project commands
program.addCommand(createProjectsCommand())
program.addCommand(createProjectCommand())

// Endpoint commands
const endpoints = createEndpointsCommand()
endpoints.addCommand(createEndpointsSearchCommand())
program.addCommand(endpoints)
program.addCommand(createEndpointCommand())

// Schema commands
program.addCommand(createSchemasCommand())
program.addCommand(createSchemaCommand())

// Spec command
program.addCommand(createSpecCommand())

// MCP commands
program.addCommand(createMCPCommand())

// Cache commands
program.addCommand(createCacheCommand())

program.parse()
