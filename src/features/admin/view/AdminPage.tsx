import { guestInviter, guestRepository } from "@/composition"
import { Button, ButtonGroup, Chip, FormGroup, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"
import Table from "@mui/material/Table"
import { revalidatePath } from "next/cache"

/**
 * Server action to send an invite
 */
const sendInvite = async (formData: FormData): Promise<void> => {
    'use server'
    
    const email = formData.get('email') as string
    const projects = formData.get('projects') as string
    
    guestInviter.inviteGuestByEmail(email as string)
    guestRepository.create(email as string, projects.split(",").map(p => p.trim()))
    
    revalidatePath('/admin/guests')
}

/**
 * Server action to remove a guest
 */
const removeGuest = async (formData: FormData): Promise<void> => {
    'use server'

    const email = formData.get('email') as string

    guestRepository.removeByEmail(email)

    revalidatePath('/admin/guests')
}

const AdminPage = async () => {
    const guests = await guestRepository.getAll()   

    return (
        <>
        <h1>Guest Admin</h1>
        
        <h2>Invite Guest</h2>
        <form action={sendInvite}>
            <FormGroup row={true}>
                <TextField name="email" type="email" placeholder="Email" required />
                <TextField name="projects" placeholder="Projects" />
                <Button type="submit" variant="outlined">Send invite</Button>
            </FormGroup>
        </form>
        
        <h2>Guests</h2>
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Projects</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {guests.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell>{row.email}</TableCell>
                            <TableCell><Chip label={row.status} color={row.status=="active" ? "primary" : "default"}/></TableCell>
                            <TableCell>{row.projects.join(", ")}</TableCell>
                            <TableCell>
                                <ButtonGroup variant="outlined">
                                    <form action={removeGuest}>
                                        <input type="hidden" name="email" value={row.email} />
                                        <Button type="submit">Remove</Button>
                                    </form>
                                </ButtonGroup>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        </>
    )
}

export default AdminPage
