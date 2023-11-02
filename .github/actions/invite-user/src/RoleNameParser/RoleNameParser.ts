import IRoleNameParser from "./IRoleNameParser"

export default class RoleNameParser implements IRoleNameParser {
  parse(roleNames: string): string[] {
    return roleNames.split(",")
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0)
  }
}
