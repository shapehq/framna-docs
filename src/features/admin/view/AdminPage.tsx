import { guestRepository } from "@/composition"
import { Box, ButtonGroup, Chip, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import Table from "@mui/material/Table"
import { InviteGuestForm } from "./InviteGuestForm"
import { RemoveGuestForm } from "./RemoveGuestForm"
import { EditGuestForm } from "./EditGuestForm"

const AdminPage = async () => {
    const guests = await guestRepository.getAll()

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Admin</Typography>

            <Paper sx={{ p: 2, my: 4 }} elevation={2} >
                <Typography variant="h6" gutterBottom>Invite Guest</Typography>
                <Typography variant="body2" gutterBottom>
                    Invite a guest to access the platform. An invitation email will be sent to the provided email address.
                </Typography>
                <InviteGuestForm />
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
                                    <TableCell><Chip label={row.status} color={row.status == "active" ? "primary" : "default"} /></TableCell>
                                    <TableCell>{row.projects.join(", ")}</TableCell>
                                    <TableCell>
                                        <ButtonGroup variant="outlined">
                                            <EditGuestForm />
                                            <RemoveGuestForm email={row.email} />
                                        </ButtonGroup>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    )
}

export default AdminPage
