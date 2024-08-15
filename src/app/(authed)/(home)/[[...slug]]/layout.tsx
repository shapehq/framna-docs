import { Box } from "@mui/material"

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ flexGrow: "1" }}>
      <Box sx={{
        height: "100%",
        paddingTop: 2,
        marginLeft: 1,
        marginRight: 2
      }}>
        <Box sx={{
          height: "100%",
          background: "white",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)",
          borderTopLeftRadius: "18px",
          borderTopRightRadius: "18px"
        }}>
          {children}
        </Box>
      </Box>
    </main>
  )
}