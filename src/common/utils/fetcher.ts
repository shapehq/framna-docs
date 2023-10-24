 /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
 export default async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const error: any = new Error("An error occurred while fetching the data.")
    error.info = await res.json()
    error.status = res.status
    throw error
  }
  return res.json()
}
