const saneParseInt = (str: string) => {
  const forcedString = `${str}`
  const num = parseInt(forcedString, 10)
  if (isNaN(num) || forcedString.trim() !== num.toString()) {
    return undefined
  }
  return num
}

export default saneParseInt
