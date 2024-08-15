"use client"

import { SxProps } from "@mui/system"
import { Drawer as MuiDrawer } from "@mui/material"
import { useTheme } from "@mui/material/styles"

const PrimaryContainer = ({
  width,
  isOpen,
  onClose,
  children
}: {
  width: number
  isOpen: boolean
  onClose?: () => void
  children?: React.ReactNode
}) => {
  return (
    <>
      <_PrimaryContainer 
        variant="temporary"
        width={width}
        isOpen={isOpen}
        onClose={onClose}
        keepMounted={true}
        sx={{ display: { xs: "block", sm: "none" } }}
      >
        {children}
      </_PrimaryContainer>
      <_PrimaryContainer 
        variant="persistent"
        width={width}
        isOpen={isOpen}
        keepMounted={false}
        sx={{ display: { xs: "none", sm: "block" } }}
        >
          {children}
        </_PrimaryContainer>
    </>
  )
}

export default PrimaryContainer

const _PrimaryContainer = ({
  variant,
  width,
  isOpen,
  onClose,
  keepMounted,
  sx,
  children
}: {
  variant: "persistent" | "temporary",
  width: number
  isOpen: boolean
  onClose?: () => void
  keepMounted?: boolean
  sx: SxProps,
  children?: React.ReactNode
}) => {
  const theme = useTheme()
  return (
    <MuiDrawer
      variant={variant}
      anchor="left"
      open={isOpen}
      onClose={onClose}
      ModalProps={{
        keepMounted: keepMounted || false
      }}
      sx={{ 
        ...sx,
        width: width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: width,
          boxSizing: "border-box",
          borderRight: 0,
          background: theme.palette.background.default
        }
     }}
    >
      {children}
    </MuiDrawer>
  )
}