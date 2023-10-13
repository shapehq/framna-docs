import axios from 'axios'
import { INetworkClient } from './INetworkClient'
import { INetworkResponse } from './INetworkResponse'
import { INetworkRequest } from './INetworkRequest'

export class AxiosNetworkClient implements INetworkClient {
  async get<ResponseBody>(request: INetworkRequest): Promise<INetworkResponse<ResponseBody>> {
    return await this.send({
      method: 'get',
      url: request.url,
      headers: request.headers
    })
  }
  
  async post<ResponseBody>(request: INetworkRequest): Promise<INetworkResponse<ResponseBody>> {
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
  }): Promise<INetworkResponse<ResponseBody>> {
    const response = await axios({
      method: request.method,
      url: request.url,
      headers: request.headers || {},
      data: request.data
    })
    return {status: response.status, body: response.data}
  }
}
