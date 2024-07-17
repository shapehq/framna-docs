import fs from "fs"

let str = "unavailable"
if (process.env.NODE_ENV !== "test") {
  str = fs.readFileSync("public/images/logo.png", "base64")
}
export default str
