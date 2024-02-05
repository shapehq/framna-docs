import "./globals.css"
import type { Metadata } from "next"
import SessionProvider from "@/features/auth/view/client/SessionProvider"
import { config as fontAwesomeConfig } from "@fortawesome/fontawesome-svg-core"
import { CssBaseline } from "@mui/material"
import ThemeRegistry from "../common/theme/ThemeRegistry"
import ErrorHandler from "../common/errors/client/ErrorHandler"
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
        <SessionProvider>
          <ErrorHandler>
            <body>
              <CssBaseline/>
              {children}
            </body>
          </ErrorHandler>
        </SessionProvider>
      </ThemeRegistry>
    </html>
  )
}
