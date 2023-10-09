import { NetworkClient } from "@/lib/networking/NetworkClient"
import { NetworkRequest } from "@/lib/networking/NetworkRequest"
import { NetworkResponse } from "@/lib/networking/NetworkResponse"

export class MockNetworkClient implements NetworkClient {
  response: NetworkResponse<any> | null = null
  
  async get<ResponseBody>(_request: NetworkRequest): Promise<NetworkResponse<ResponseBody>> {
    if (this.response) {
      return this.response
    } else {
      throw new Error("Response value not set.")
    }
  }
  
  async post<ResponseBody>(_request: NetworkRequest): Promise<NetworkResponse<ResponseBody>> {
    if (this.response) {
      return this.response
    } else {
      throw new Error("Response value not set.")
    }
  }
}
