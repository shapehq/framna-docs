import { createTheme } from "@mui/material/styles"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCaretDown } from "@fortawesome/free-solid-svg-icons"
import "@fontsource/poppins/400.css"
import "@fontsource/poppins/500.css"
import "@fontsource/poppins/700.css"

export const BASE_COLORS = ["#01BBFE", "#00AE47", "#FCB23D"]

export const softPaperSx = {
  boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  borderRadius: "18px"
}

declare module "@mui/material/styles" {
  interface TypographyVariants {
    body0: React.CSSProperties;
    body3: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    body0?: React.CSSProperties;
    body3?: React.CSSProperties;
  }
}

// Extend the TypographyPropsVariantOverrides to include body3
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    body0: true;
    body3: true;
  }
}

const theme = () => createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#000000"
      },
      secondary: {
        main: "#000000"
      },
      background: {
        default: "#f8f8f8"
      },
      divider: "#f8f8f8"
    },
    typography: {
      fontFamily: [
        'Poppins',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"'
      ].join(","),
      button: {
        textTransform: "none"
      },
      body0: {
        fontSize: "0.875rem", // 14px
        lineHeight: 1.5,
      },
      body1: {
        fontSize: "1rem", // 16px based on 16px
        lineHeight: 1.5,
      },
      body2: {
        fontSize: "1.1rem", // 17.5px
        lineHeight: 1.5,
      },
      body3: {
        fontSize: "1.25rem", // 20px
        lineHeight: 1.5,
      },
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
            borderRadius: "20px",
            "&:hover": {
              background: "#f2f2f2"
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#f2f2f2",
              borderWidth: "1px"
            },
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: "#f2f2f2"
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#f2f2f2",
              borderWidth: "1px"
            }
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
                  marginRight: "5px",
                  color: "black"
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
              fontWeight: 700
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
