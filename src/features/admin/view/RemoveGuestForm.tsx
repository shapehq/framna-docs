'use client'

import { Button } from "@mui/material";
import { removeGuest } from "./Actions";

export const RemoveGuestForm = ({ email }: { email: string }) => {
    const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        if (confirm(`Please confirm that you want to remove ${email}`) === false) return
        e.currentTarget.form?.submit()
    }

    return (
        <form action={removeGuest}>
            <input type="hidden" name="email" value={email} />
            <Button onClick={onClick}>Remove</Button>
        </form>
    )
}