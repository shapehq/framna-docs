const listFromCommaSeparatedString = (str?: string) => {
  if (!str) {
    return []
  }
  return str
    .split(",")
    .map(e => e.trim())
    .filter(e => e.length > 0)
}

export default listFromCommaSeparatedString
