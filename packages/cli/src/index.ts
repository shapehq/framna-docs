#!/usr/bin/env node

import { Command } from "commander"
import { createAuthCommand } from "./commands/auth/index.js"
import {
  createProjectsCommand,
  createProjectsListCommand,
  createProjectsGetCommand,
} from "./commands/projects.js"
import {
  createEndpointsCommand,
  createEndpointsListCommand,
  createEndpointsSearchCommand,
  createEndpointGetCommand,
} from "./commands/endpoints.js"
import {
  createSchemasCommand,
  createSchemasListCommand,
  createSchemasGetCommand,
} from "./commands/schemas.js"
import { createSpecCommand } from "./commands/spec.js"
import { createCacheCommand } from "./commands/cache.js"

const program = new Command()

program
  .name("framna-docs")
  .description("CLI for Framna Docs - OpenAPI documentation portal")
  .version("0.1.0")

// Auth commands
program.addCommand(createAuthCommand())

// Project commands
const projects = createProjectsCommand()
projects.addCommand(createProjectsListCommand())
projects.addCommand(createProjectsGetCommand())
program.addCommand(projects)

// Endpoint commands
const endpoints = createEndpointsCommand()
endpoints.addCommand(createEndpointsListCommand())
endpoints.addCommand(createEndpointsSearchCommand())
endpoints.addCommand(createEndpointGetCommand())
program.addCommand(endpoints)

// Schema commands
const schemas = createSchemasCommand()
schemas.addCommand(createSchemasListCommand())
schemas.addCommand(createSchemasGetCommand())
program.addCommand(schemas)

// Spec command
program.addCommand(createSpecCommand())

// Cache commands
program.addCommand(createCacheCommand())

program.parse()
