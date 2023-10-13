import { INetworkRequest } from "./INetworkRequest"
import { INetworkResponse } from "./INetworkResponse"

export interface INetworkClient {
  get<ResponseBody>(request: INetworkRequest): Promise<INetworkResponse<ResponseBody>>
  post<ResponseBody>(request: INetworkRequest): Promise<INetworkResponse<ResponseBody>>
}
