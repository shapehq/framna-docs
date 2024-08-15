import { Box } from "@mui/material"

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <RaisedMainContent>
      {children}
    </RaisedMainContent>
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