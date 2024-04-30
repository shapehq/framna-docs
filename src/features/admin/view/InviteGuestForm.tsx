'use client'

import { useFormState } from 'react-dom'
import { SendInviteResult, sendInvite } from './Actions'
import { Alert, Button, FormGroup, TextField } from '@mui/material'

const initialState: SendInviteResult = {
    success: false,
}

export const InviteGuestForm = () => {
    const [state, formAction] = useFormState(sendInvite, initialState)

    return (
        <form action={formAction}>
            {state.error && <Alert severity="error" sx={{ mb: 1 }}>Failed to invite guest: {state.error}</Alert>}
            {state.success && 
                <Alert severity="success" sx={{ mb: 1 }}>
                    Guest was invited successfully 🥳
                </Alert>}
            <FormGroup row={true}>
                <TextField name="email" type="email" placeholder="Email" required sx={{ mr: 1 }} />
                <TextField name="projects" placeholder="Projects (repositories separated by comma)" sx={{ mr: 1 }} />
                <Button type="submit" variant="outlined">Send invite</Button>
            </FormGroup>
        </form>
    )
}
