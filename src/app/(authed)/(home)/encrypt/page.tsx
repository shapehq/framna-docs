import { Box, Typography } from '@mui/material'
import MessageLinkFooter from "@/common/ui/MessageLinkFooter"
import { EncryptionForm } from "@/features/encrypt/view/EncryptionForm"
import { env } from '@/common'

const HELP_URL = env.getOrThrow("FRAMNA_DOCS_HELP_URL")
const SITE_NAME = env.getOrThrow("FRAMNA_DOCS_TITLE")

export default async function EncryptPage() {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width={1}
        >
            <Box
                display="flex"
                alignItems="center"
                flexDirection="column"
                gap={6}
                sx={{ width: '80%', maxWidth: '600px' }}
            >
                <Typography variant="h4">
                    Encrypt secrets
                </Typography>
                <Typography sx={{ textAlign: "center" }}>
                    When adding authentication information to remote specifications it 
                    is required to encrypt the authentication information with our public 
                    key before storing it in the repository.<br />
                    <br />
                    This page allows you to encrypt the secret using {SITE_NAME}{SITE_NAME.endsWith('s') ? "'" : "'s"} 
                    public key, which means only {SITE_NAME} can decrypt it.
                </Typography>
                <EncryptionForm />
                {HELP_URL &&
                    <MessageLinkFooter
                        url={HELP_URL}
                        content="Need help? Explore our wiki for more info."
                    />
                }
            </Box>
        </Box>
    )
}
