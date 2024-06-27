export default (str: string) => {
  const num = parseInt(str, 10)
  if (isNaN(num) || str.trim() !== num.toString()) {
    return undefined
  }
  return num
}
