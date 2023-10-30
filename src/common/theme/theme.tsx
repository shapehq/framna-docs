import { createTheme } from "@mui/material/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCaretDown } from "@fortawesome/free-solid-svg-icons"

export const softPaperSx = {
  boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  borderRadius: "12px"
}

const theme = () => createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000000"
    },
    secondary: {
      main: "#000000"
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
    },
    MuiSelect: {
      styleOverrides: {
        root: () => ({
          borderRadius: "20px"
        })
      },
      defaultProps: {
        MenuProps: {
          PaperProps: {
            sx: softPaperSx
          }
        },
        IconComponent: (props) => {
          return (
            <FontAwesomeIcon
              icon={faCaretDown}
              className={props.className}
              style={{
                marginRight: "5px"
              }}
            />
          )
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        root: ({ theme }) => ({
          margin: theme.spacing(0.5)
        })
      }
    },
    MuiList: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: 0,
          margin: 0,
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(1),
          "& li": {
            padding: 0,
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1)
          },
          "& li.Mui-selected": {
            background: "transparent",
            fontWeight: "bold"
          },
          "& li:hover, & li.Mui-selected.Mui-focusVisible, & li.Mui-selected:hover, && .Mui-selected, && .Mui-selected:hover, & .MuiListItemButton-root:hover": { 
            background: "transparent"
          },
          "& li:hover .hover-highlight, & li.Mui-selected:hover .hover-highlight": {
            background: "rgba(0, 0, 0, 0.05)"
          },
          "& li:hover .hover-highlight-disabled, & li.Mui-selected:hover .hover-highlight-disabled": { 
            background: "transparent"
          },
          // Used on mobile where we do not want hovering.
          "& li:active .active-highlight, & li.Mui-selected:active .active-highlight": {
            background: "rgba(0, 0, 0, 0.05)"
          },
          // Used on mobile where we do not want hovering.
          "& li:active .active-highlight-disabled, & li.Mui-selected:active .active-highlight-disabled": { 
            background: "transparent"
          },
          "& li .menu-item-highlight, & li .menu-item-highlight": {
            paddingLeft: theme.spacing(1.25),
            paddingRight: theme.spacing(1.25),
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            borderRadius: "12px"
          }
        })
      }
    },
    MuiPopover: {
      defaultProps: {
        PaperProps: {
          elevation: 0,
          sx: softPaperSx
        }
      }
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536
    }
  }
})

export default theme
