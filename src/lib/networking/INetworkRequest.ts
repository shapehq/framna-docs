export interface INetworkRequest {
  url: string
  headers?: {[key: string]: string}
  body?: any
}
