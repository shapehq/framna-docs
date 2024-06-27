export default (str: string) => {
  let forcedString = `${str}`
  const num = parseInt(forcedString, 10)
  if (isNaN(num) || forcedString.trim() !== num.toString()) {
    return undefined
  }
  return num
}
