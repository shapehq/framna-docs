'use client'

import { useState } from 'react'
import { Box, Button, Snackbar, TextField, Tooltip } from '@mui/material'
import { encrypt } from "./encryptAction"

export const EncryptionForm = () => {
    const [inputText, setInputText] = useState('')
    const [encryptedText, setEncryptedText] = useState('')
    const [openSnackbar, setOpenSnackbar] = useState(false)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        const encrypted = await encrypt(inputText)
        setEncryptedText(encrypted)
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(encryptedText)
        setOpenSnackbar(true)
    }

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false)
    }

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
            <TextField
                value={encryptedText}
                onClick={handleCopy}
                sx={{ input: { cursor: 'pointer' }, width: "300px" }}
                slotProps={{ input: { readOnly: true } }}
                placeholder="Encrypted text will appear here"
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
