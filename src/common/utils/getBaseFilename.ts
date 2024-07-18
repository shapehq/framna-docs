export default function getBaseFilename(filePath: string): string {
  const filename = filePath.split("/").pop() || ""
  if (!filename.includes(".")) {
    return filename
  }
  return filename.split(".").slice(0, -1).join(".")
}
