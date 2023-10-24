type OAuthToken = {
  readonly accessToken: string
  readonly refreshToken: string
  readonly accessTokenExpiryDate: Date
  readonly refreshTokenExpiryDate: Date
}

export default OAuthToken
