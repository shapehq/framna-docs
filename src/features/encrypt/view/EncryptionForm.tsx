'use client'

import { useState } from 'react'
import { Box, Button, Snackbar, TextField, Tooltip, InputAdornment } from '@mui/material'
import { styled } from '@mui/material/styles'
import AccountCircle from '@mui/icons-material/AccountCircle';
import { encrypt } from "./encryptAction"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClipboard } from "@fortawesome/free-regular-svg-icons"

export const EncryptionForm = () => {
    const [inputText, setInputText] = useState('')
    const [encryptedText, setEncryptedText] = useState('')
    const [openSnackbar, setOpenSnackbar] = useState(false)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (inputText.length > 0) {
            const encrypted = await encrypt(inputText)
            setEncryptedText(encrypted)
        } else {
            setEncryptedText("")
        }
    }

    const handleCopy = () => {
        if (encryptedText.length > 0) {
            navigator.clipboard.writeText(encryptedText)
            setOpenSnackbar(true)
        }
    }

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false)
    }
    
    const EncryptedValueTextField = styled(TextField)({
        '& .MuiInputBase-root': {
            backgroundColor: '#F8F8F8'
        }
    })

    return <Box
        component="form"
        onSubmit={handleSubmit}
        display="flex"
        flexDirection="column"
        gap={2}
        alignItems="center"
    >
        <TextField
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            multiline
            rows={8}
            variant="outlined"
            placeholder="Enter text to encrypt"
            sx={{ width: "300px" }}
        />
        
        <Button 
            type="submit" 
            variant="outlined" 
            color="primary"
            size="large"
            sx={{ width: "300px" }}
        >Encrypt</Button>

        <Tooltip title="Click to copy to clipboard">
            <EncryptedValueTextField
                value={encryptedText}
                onClick={handleCopy}
                sx={{
                    width: "300px",
                    input: {
                        cursor: "pointer",
                        color: "#727272"
                    }
                }}
                slotProps={{
                  input: {
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                            <FontAwesomeIcon icon={faClipboard} size="lg" />
                        </InputAdornment>
                    )
                  }
                }}
                placeholder="Encrypted text appears here"
              />
        </Tooltip>
        
        <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            message="Copied to clipboard"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        />
    </Box>;
}
