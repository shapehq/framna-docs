import "./globals.css"
import type { Metadata } from "next"
import { config as fontAwesomeConfig } from "@fortawesome/fontawesome-svg-core"
import { CssBaseline } from "@mui/material"
import ThemeRegistry from "@/common/theme/ThemeRegistry"
import "@fortawesome/fontawesome-svg-core/styles.css"
import { env } from "@/common"

fontAwesomeConfig.autoAddCss = false

export const metadata: Metadata = {
  title: env.getOrThrow("NEXT_PUBLIC_FRAMNA_DOCS_TITLE"),
  description: env.getOrThrow("NEXT_PUBLIC_FRAMNA_DOCS_DESCRIPTION")
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <ThemeRegistry options={{ key: "mui" }}>
        <body style={{ overflow: "hidden" }}>
          <CssBaseline/>
          {children}
        </body>
      </ThemeRegistry>
    </html>
  )
}
