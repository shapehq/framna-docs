import { createTheme } from "@mui/material/styles"
import { blue } from "@mui/material/colors"

const theme = () => createTheme({
  palette: {
    mode: "light",
    primary: {
      main: blue[700]
    },
    secondary: {
      main: blue[700]
    }
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
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    }
  }
})

export default theme
