'use client'

import { Button } from "@mui/material";
import { removeGuest } from "./Actions";

export const RemoveGuestForm = ({ email }: { email: string }) =>
    <form action={removeGuest}>
        <input type="hidden" name="email" value={email} />
        <Button type="submit">Remove</Button>
    </form>
