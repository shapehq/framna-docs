import axios from 'axios'
import { NetworkClient } from './NetworkClient'
import { NetworkResponse } from './NetworkResponse'
import { NetworkRequest } from './NetworkRequest'

export class AxiosNetworkClient implements NetworkClient {
  async get<ResponseBody>(request: NetworkRequest): Promise<NetworkResponse<ResponseBody>> {
    return await this.send({
      method: 'get',
      url: request.url,
      headers: request.headers
    })
  }
  
  async post<ResponseBody>(request: NetworkRequest): Promise<NetworkResponse<ResponseBody>> {
    return await this.send({
      method: 'post',
      url: request.url,
      headers: request.headers,
      data: request.body
    })
  }
  
  async send<ResponseBody>(request: {
    method: string,
    url: string,
    headers?: {[key: string]: string},
    data?: any
  }): Promise<NetworkResponse<ResponseBody>> {
    const response = await axios({
      method: request.method,
      url: request.url,
      headers: request.headers || {},
      data: request.data
    })
    return {status: response.status, body: response.data}
  }
}
