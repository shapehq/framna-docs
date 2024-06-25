import "./globals.css"
import type { Metadata } from "next"
import { config as fontAwesomeConfig } from "@fortawesome/fontawesome-svg-core"
import { CssBaseline } from "@mui/material"
import ThemeRegistry from "@/common/theme/ThemeRegistry"
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
        <body>
          <CssBaseline/>
          {children}
        </body>
      </ThemeRegistry>
    </html>
  )
}
