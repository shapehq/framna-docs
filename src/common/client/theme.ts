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
  }
})

export default theme
