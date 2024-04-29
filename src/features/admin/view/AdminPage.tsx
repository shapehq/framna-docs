import { guestInviter, guestRepository } from "@/composition"
import { Box, Button, ButtonGroup, Chip, FormGroup, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material"
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
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Admin</Typography>

            <Paper sx={{ p: 2, my: 4 }} elevation={2} >
                <Typography variant="h6" gutterBottom>Invite Guest</Typography>
                <Typography variant="body2" gutterBottom>
                    Invite a guest to access the platform. An invitation email will be sent to the provided email address.
                </Typography>
                <form action={sendInvite}>
                    <FormGroup row={true}>
                        <TextField name="email" type="email" placeholder="Email" required sx={{ mr: 1 }} />
                        <TextField name="projects" placeholder="Projects" sx={{ mr: 1 }} />
                        <Button type="submit" variant="outlined">Send invite</Button>
                    </FormGroup>
                </form>
            </Paper>
            <Typography variant="h6" gutterBottom>Guests</Typography>

            <Typography variant="body2" gutterBottom>
                Manage guests who have access to the platform.
            </Typography>
            <Paper>
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
            </Paper>
        </Box>
        </>
    )
}

export default AdminPage
