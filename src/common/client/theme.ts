import { createTheme } from "@mui/material/styles"
import { blue } from '@mui/material/colors'

const theme = createTheme({
  palette: {
    primary: blue,
    secondary: blue,
  },
  typography: {
    button: {
      textTransform: "none"
    }
  }
})

export default theme
