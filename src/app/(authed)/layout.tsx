import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"
import { session, projectRepository } from "@/composition"
import { Box } from "@mui/material"
import ErrorHandler from "@/common/ui/ErrorHandler"
import SessionBarrier from "@/features/auth/view/SessionBarrier"
import ProjectsContextProvider from "@/features/projects/view/ProjectsContextProvider"
import { SplitView } from "@/features/sidebar/view"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = await session.getIsAuthenticated()
  if (!isAuthenticated) {
    return redirect("/api/auth/signin")
  }
  const projects = await projectRepository.get()
  return (
    <ErrorHandler>
      <SessionProvider>
        <SessionBarrier>
          <ProjectsContextProvider initialProjects={projects}>
            <SplitView>
              <RaisedMainContent>
                {children}
              </RaisedMainContent>
            </SplitView>
          </ProjectsContextProvider>
        </SessionBarrier>
      </SessionProvider>
    </ErrorHandler>
  )
}

const RaisedMainContent = ({ children }: { children?: React.ReactNode }) => {
  return (
    <main style={{ flexGrow: "1" }}>
      <Box sx={{
        height: "100%",
        paddingTop: { xs: 0, sm: 2 },
        marginLeft: { xs: 0, sm: 1 },
        marginRight: { xs: 0, sm: 2 }
      }}>
        <Box sx={{
          height: "100%",
          background: "white",
          boxShadow: { xs: 0, sm: "0 4px 8px rgba(0, 0, 0, 0.08)" },
          borderTopLeftRadius: { xs: 0, sm: "18px" },
          borderTopRightRadius: { xs: 0, sm: "18px" }
        }}>
          {children}
        </Box>
      </Box>
    </main>
  )
}
