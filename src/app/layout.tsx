import "./globals.css"
import type { Metadata } from "next"
import { UserProvider } from "@auth0/nextjs-auth0/client"
import { Inter } from "next/font/google"
import { CssBaseline } from "@mui/material"
import ThemeRegistry from "@/common/theme/ThemeRegistry"
import ErrorHandler from "@/common/errorHandling/client/ErrorHandler"

const inter = Inter({ subsets: ["latin"] })

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
            <body className={inter.className}>
              <CssBaseline/>
              {children}
            </body>
          </ErrorHandler>
        </UserProvider>
      </ThemeRegistry>
    </html>
  )
}
