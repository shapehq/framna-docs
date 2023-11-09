enum SessionValidity {
  VALID = "valid",
  INVALID_ACCESS_TOKEN = "invalid_access_token",
  OUTSIDE_GITHUB_ORGANIZATION = "outside_github_organization",
  GITHUB_APP_BLOCKED = "github_app_blocked"
}

export default SessionValidity

export function mergeSessionValidity(
  lhs: SessionValidity,
  rhs: SessionValidity
): SessionValidity {
  if (lhs != SessionValidity.VALID) {
    return lhs
  } else if (rhs != SessionValidity.VALID) {
    return rhs
  } else {
    return SessionValidity.VALID
  }
}
