export interface AccessTokenProviding {
  getAccessToken(): Promise<string>
}
