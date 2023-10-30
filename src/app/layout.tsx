import "./globals.css"
import type { Metadata } from "next"
import { UserProvider } from "@auth0/nextjs-auth0/client"
import { config as fontAwesomeConfig } from "@fortawesome/fontawesome-svg-core"
import { CssBaseline } from "@mui/material"
import ThemeRegistry from "@/common/theme/ThemeRegistry"
import ErrorHandler from "@/common/errorHandling/client/ErrorHandler"
import "@fortawesome/fontawesome-svg-core/styles.css"

fontAwesomeConfig.autoAddCss = false

export const metadata: Metadata = {
  title: "Shape Docs",
  description: "Documentation for Shape\"s APIs",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <ThemeRegistry options={{ key: "mui" }}>
        <UserProvider>
          <ErrorHandler>
            <body>
              <CssBaseline/>
              {children}
            </body>
          </ErrorHandler>
        </UserProvider>
      </ThemeRegistry>
    </html>
  )
}
