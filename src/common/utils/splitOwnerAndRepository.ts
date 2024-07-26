// Split full repository names into owner and repository.
// shapehq/foo becomes { owner: "shapehq", "repository": "foo" }
const splitOwnerAndRepository = (str: string) => {
  const index = str.indexOf("/")
  if (index === -1) {
    return undefined
  }
  const owner = str.substring(0, index)
  const repository = str.substring(index + 1) 
  if (owner.length == 0 || repository.length == 0) {
    return undefined
  }
  return { owner, repository }
}

export default splitOwnerAndRepository
