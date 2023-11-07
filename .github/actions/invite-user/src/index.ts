import * as core from "@actions/core"
import Action from "./Action"
import Auth0UserClient from "./UserClient/Auth0UserClient"
import getOptions from "./getOptions"
import Logger from "./Logger/Logger"
import KeyValueStateStore from "./StateStore/KeyValueStateStore"
import PasswordGenerator from "./PasswordGenerator/PasswordGenerator"
import RoleNameParser from "./RoleNameParser/RoleNameParser"

const {
  AUTH0_MANAGEMENT_CLIENT_ID,
  AUTH0_MANAGEMENT_CLIENT_SECRET,
  AUTH0_MANAGEMENT_CLIENT_DOMAIN
} = process.env

if (!AUTH0_MANAGEMENT_CLIENT_ID || AUTH0_MANAGEMENT_CLIENT_ID.length == 0) {
  throw new Error("AUTH0_MANAGEMENT_CLIENT_ID environment variable not set.")
} else if (!AUTH0_MANAGEMENT_CLIENT_SECRET || AUTH0_MANAGEMENT_CLIENT_SECRET.length == 0) {
  throw new Error("AUTH0_MANAGEMENT_CLIENT_ID environment variable not set.")
} else if (!AUTH0_MANAGEMENT_CLIENT_DOMAIN || AUTH0_MANAGEMENT_CLIENT_DOMAIN.length == 0) {
  throw new Error("AUTH0_MANAGEMENT_CLIENT_ID environment variable not set.")
}

const stateStore = new KeyValueStateStore(core)
const logger = new Logger()
const userClient = new Auth0UserClient({
  clientId: AUTH0_MANAGEMENT_CLIENT_ID,
  clientSecret: AUTH0_MANAGEMENT_CLIENT_SECRET,
  domain: AUTH0_MANAGEMENT_CLIENT_DOMAIN
})
const passwordGenerator = new PasswordGenerator()
const roleNameParser = new RoleNameParser()
const action = new Action({
  stateStore,
  logger,
  userClient,
  passwordGenerator,
  roleNameParser
})
action.run(getOptions()).catch((err: Error) => {
  logger.error(err.toString())
})
