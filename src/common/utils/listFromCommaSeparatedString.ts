const listFromCommaSeparatedString = (str?: string) => {
  if (!str) {
    return []
  }
  return str.split(",").map(e => e.trim())
}

export default listFromCommaSeparatedString
