import "./globals.css"
import type { Metadata } from "next"
import { config as fontAwesomeConfig } from "@fortawesome/fontawesome-svg-core"
import { CssBaseline } from "@mui/material"
import ThemeRegistry from "@/common/theme/ThemeRegistry"
import "@fortawesome/fontawesome-svg-core/styles.css"
import { env } from "@/common"
import NextTopLoader from 'nextjs-toploader'

fontAwesomeConfig.autoAddCss = false

export const metadata: Metadata = {
  title: env.getOrThrow("FRAMNA_DOCS_TITLE"),
  description: env.getOrThrow("FRAMNA_DOCS_DESCRIPTION")
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <ThemeRegistry options={{ key: "mui" }}>
        <body>
          <CssBaseline/>
            <NextTopLoader color="#000" height={1} showSpinner={false} speed={600} zIndex={1600} />
            {children}
        </body>
      </ThemeRegistry>
    </html>
  )
}
