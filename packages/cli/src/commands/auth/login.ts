import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import open from "open"
import { APIClient } from "../../api.js"
import { saveSession, getServerUrl } from "../../config.js"

interface DeviceFlowResponse {
  userCode: string
  verificationUri: string
  deviceCode: string
  sessionId: string
  expiresIn: number
  interval: number
}

interface StatusResponse {
  status: "pending" | "complete" | "error"
  sessionId?: string
  error?: string
}

export function createLoginCommand(): Command {
  return new Command("login")
    .description("Authenticate with Framna Docs via GitHub")
    .action(async () => {
      const serverUrl = getServerUrl()
      const client = new APIClient(serverUrl)
      const spinner = ora()

      try {
        spinner.start("Initiating authentication...")
        const deviceFlow = await client.post<DeviceFlowResponse>("/api/cli/auth/device")
        spinner.stop()

        console.log()
        console.log(chalk.bold("To authenticate, visit:"))
        console.log(chalk.cyan(deviceFlow.verificationUri))
        console.log()
        console.log(chalk.bold("And enter this code:"))
        console.log(chalk.yellow.bold(deviceFlow.userCode))
        console.log()

        try {
          await open(deviceFlow.verificationUri)
          console.log(chalk.dim("Browser opened automatically"))
        } catch {
          console.log(chalk.dim("Please open the URL manually"))
        }

        spinner.start("Waiting for authorization...")

        const pollInterval = (deviceFlow.interval || 5) * 1000
        const maxAttempts = Math.floor((deviceFlow.expiresIn * 1000) / pollInterval)

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, pollInterval))

          const status = await client.get<StatusResponse>("/api/cli/auth/status", {
            device_code: deviceFlow.deviceCode,
          })

          if (status.status === "complete" && status.sessionId) {
            spinner.succeed("Authentication successful!")
            await saveSession(status.sessionId)
            console.log(chalk.green("\nYou are now logged in."))
            return
          }

          if (status.status === "error") {
            spinner.fail("Authentication failed")
            console.error(chalk.red(status.error || "Unknown error"))
            process.exit(1)
          }
        }

        spinner.fail("Authentication timed out")
        process.exit(1)
      } catch (error) {
        spinner.fail("Authentication failed")
        console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
        process.exit(1)
      }
    })
}
