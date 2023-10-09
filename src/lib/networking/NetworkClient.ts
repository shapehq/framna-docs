import { NetworkRequest } from "./NetworkRequest"
import { NetworkResponse } from "./NetworkResponse"

export interface NetworkClient {
  get<ResponseBody>(request: NetworkRequest): Promise<NetworkResponse<ResponseBody>>
  post<ResponseBody>(request: NetworkRequest): Promise<NetworkResponse<ResponseBody>>
}
