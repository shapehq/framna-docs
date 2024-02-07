import { guestRepository } from "@/composition"
import { Button, ButtonGroup, Chip, FormGroup, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"
import Table from "@mui/material/Table"

const AdminPage = async () => {
    const guests = await guestRepository.getAll()

    return (
        <>
        <h1>Guest Admin</h1>
        
        <h2>Invite Guest</h2>
        <FormGroup row={true}>
            <TextField placeholder="Email" />
            <TextField placeholder="Projects" />
            <Button variant="outlined">Send invite</Button>
        </FormGroup>
        
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
                                    <Button href={`/edit/${row.id}`}>Edit</Button>
                                    <Button>Remove</Button>
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
