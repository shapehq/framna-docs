import { createTheme } from "@mui/material/styles"
import { blue } from "@mui/material/colors"

const theme = (_prefersDarkMode: boolean) => createTheme({
  palette: {
    mode: "light",
    primary: blue,
    secondary: blue
  },
  typography: {
    button: {
      textTransform: "none"
    }
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true
      }
    }
  }
})

export default theme
