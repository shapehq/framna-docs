import { NextRequest, NextResponse } from "next/server"
import { session } from "@/composition"
import { env, makeAPIErrorResponse, makeUnauthenticatedAPIErrorResponse } from "@/common"
import { privateDecrypt, constants } from 'crypto'
import { z } from 'zod';
import { downloadFile } from "./downloadFile";
import { checkIfJsonOrYaml } from "./checkIfJsonOrYaml";

export const ErrorName = {
  MAX_FILE_SIZE_EXCEEDED: "MaxFileSizeExceededError",
  TIMEOUT: "TimeoutError",
  NOT_JSON_OR_YAML: "NotJsonOrYamlError",
}

interface RemoteSpecificationParams {
  encodedRemoteSpecification: string
}

const AuthSchema = z.object({
  type: z.string(),
  username: z.string(),
  password: z.string(),
});
type Auth = z.infer<typeof AuthSchema>;

const RemoteSpecificationSchema = z.object({
  url: z.string().url(),
  auth: AuthSchema.optional(),
});
type RemoteSpecification = z.infer<typeof RemoteSpecificationSchema>;

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDPvqSIXsEJIHro
Mw3Lsxmq91LVVBCEnIYZO4rVBk2mdA7FADwqfv/2T0tA49eYd8RcZp8CHWDmK36a
OVsN3sMy3Lh7YwaIFqOAyD6gm1hPlpb0oJE4U3a9aZXh9WnaWepCKNHJhxSWhlL2
6h+miv8vblSFvG+6v0FVbh4obXDMbp/ruf+BHZEns+KMczkQp5HaNHLRVoeW76n8
E473cM4kdSeJBSJmcSdhMB+b0P1QypozbJxqh+tztMPdqf9w58QKFE4KTqyVE/pw
RnLCBN31YaD6CL3VtGGHJdZwKqLfEWfnRvWBu87HOJHwVXCTAW8osbLXI5SdZAfJ
bTEcSaXTAgMBAAECggEAAaf9zQZXwg8NJAn68pm0FkJc0geqFmlqQjaxy2ISBvSq
o+bS8RAnl7UdZphuTJ7hhAEhj+H3Wa3ufCfLc1DMHu2Qw+yELtB6Do8lSG6CMkaK
8z95jcLrnWwuAx5AH6tmgodtglCHA9r8t+pf+zEyzBvDzEHB+FaBhVJ5i3CaOgnn
sldRDFXPbIK5vp9znNmJiCttdFh4o1zClVybH+GdDXERlal9zBAdOGR9RQsW5Ps8
rEldFdInFdW2Jwzg1Q2AMu0+uxdpGDX2s//jp6q99W4VZFrq1NAoqfGDAaRePJ23
w5K1qoLTXF+IkvBRK749SznUcZyE4ZmLHJoKCVjMYQKBgQDxulf0fw1h1+jQ9OmC
Dim8UV82WyjOknDyhpdpHauhcPQQwMDgF6ugZA5H5HZRAnjWNctEcQ72V+ET/6eU
9SUmvnI6z+gd/eJGGKQxkNoTaWkkRqc6RSBwiVUc1Fv3x0nqhtd65VGIi6i6psUn
gnLvMI1QxANtcgXdb3qp1pBAGQKBgQDcAqbJ/5BgiYGgef/QoyRTI6M8ZQWJ4lf9
xrYzY+96T8JNEBshFu3gqCOclcV8jS21BTbWudpyhDradmdRRsypYTJh0HBxfzd2
gXsMZ27jDMQ8q91xhgaziEGTVKrx/02dHJaLUza6MqkfVVyAzWDx0Hu6sN5Qxe4D
8bBSmO+iywKBgC0t7+yBpqWn7hrH+7DUJtbMuqf1J85cLoIVx8zcv8xfyS4saKA5
rFlA+i5TtA12EdGvojs7illemXHccZz0qKnyJHV7kF2yqw0A5AdjlG7WX9Fo5y6L
5wFBmcfWpQ3NkLIl27Zbj/6eY73nF6hHyGWORItY528YRaJaiKmfsbxZAoGBAJUW
6uW53KG+rOwNoHBHDaeVX9neb2lny876aJ/cmf0drYLBZlD/E8YIytEioUhs90tT
ND1AhqrRtnwyfoMSYkBp0FV+haQz3GbfCX53XSpZjWW75X03oLTqod1wI8OICZVt
OQtDIbP9/qNwGhZils5nRGFX19+OsWNU1fKzFrkPAoGARA4wcLbshkxX6KGhfE5x
LB1apVkCG0y6jUAq4469svfpeILUtqgNBMBWYa9O7ID5NSfRn5DjyEl9U3SYz0H4
psXP4eE1x86Lz37lAuXPpnrtE93xiRVFMYB3KXdyeGlTpwKLSGbf8pex85yrQU42
CKpLoFTucpZ0hyD+upn2KMI=
-----END PRIVATE KEY-----`

export async function GET(req: NextRequest, { params }: { params: RemoteSpecificationParams }) {
  const isAuthenticated = await session.getIsAuthenticated()
  if (!isAuthenticated) {
    return makeUnauthenticatedAPIErrorResponse()
  }

  const encryptedRemoteSpecification = decodeURIComponent(params.encodedRemoteSpecification)

  // Decrypt the encrypted specification
  const decryptedRemoteSpecification = privateDecrypt(
    {
      key: privateKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(encryptedRemoteSpecification, 'base64')
  ).toString('utf-8')

  const remoteSpecification: RemoteSpecification = RemoteSpecificationSchema.parse(JSON.parse(decryptedRemoteSpecification))

  console.log(remoteSpecification)

  let url: URL
  try {
    url = new URL(remoteSpecification.url)
  } catch {
    return makeAPIErrorResponse(400, "Invalid \"url\" query parameter.")
  }
  try {
    const maxMegabytes = Number(env.getOrThrow("PROXY_API_MAXIMUM_FILE_SIZE_IN_MEGABYTES"))
    const timeoutInSeconds = Number(env.getOrThrow("PROXY_API_TIMEOUT_IN_SECONDS"))
    const maxBytes = maxMegabytes * 1024 * 1024
    const fileText = await downloadFile({ url, maxBytes, timeoutInSeconds, basicAuthUsername: remoteSpecification.auth?.username, basicAuthPassword: remoteSpecification.auth?.password })
    checkIfJsonOrYaml(fileText)
    return new NextResponse(fileText, { status: 200, headers: { "Content-Type": "text/plain" } })
  } catch (error) {
    if (error instanceof Error == false) {
      return makeAPIErrorResponse(500, "An unknown error occurred.")
    }
    if (error.name === ErrorName.MAX_FILE_SIZE_EXCEEDED) {
      return makeAPIErrorResponse(413, "The operation was aborted.")
    } else if (error.name === ErrorName.TIMEOUT) {
      return makeAPIErrorResponse(408, "The operation timed out.")
    } else if (error.name === ErrorName.NOT_JSON_OR_YAML) {
      return makeAPIErrorResponse(400, "Url does not point to a JSON or YAML file.")
    } else {
      return makeAPIErrorResponse(500, error.message)
    }
  }
}
