 export class FetcherError extends Error {
   readonly status: number
   
   constructor(status: number, message: string) {
     super(message)
     this.status = status
   }
 }
 
 /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
 export default async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init)
  if (!res.ok) {
    throw new FetcherError(res.status, "An error occurred while fetching the data.")
  }
  return res.json()
}
