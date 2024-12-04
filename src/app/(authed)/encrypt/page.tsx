'use client'

import { useState } from 'react'
import { encrypt } from './action'
import { Box, Button, TextareaAutosize, Typography } from '@mui/material'

export default function EncryptPage() {
    const [inputText, setInputText] = useState('')
    const [encryptedText, setEncryptedText] = useState('')

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        const encrypted = await encrypt(inputText)
        setEncryptedText(encrypted)
    }

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            height={1}
            width={1}
            gap={6}
        >
            <Typography variant="h4">
                Encrypt text for remote config
            </Typography>
            <Typography variant="body1">
                Use this to encrypt values to be used in the configuration file.<br />
                The input text is encrypted using the public key of the server.
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextareaAutosize
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    cols={50}
                    minRows={10}
                />
                <br />
                <Button type="submit" variant="outlined"
                    color="primary"
                    size="large"
                    sx={{ height: 56, width: 1 }}
                >Encrypt</Button>
            </form>
            {encryptedText && (
                <textarea readOnly value={encryptedText} rows={10} cols={50} />
            )}
        </Box>
    )
}
