import { Box, Typography } from '@mui/material'
import MessageLinkFooter from "@/common/ui/MessageLinkFooter"
import { EncryptionForm } from "@/features/encrypt/view/EncryptionForm"
import { env } from '@/common'

const HELP_URL = env.getOrThrow("FRAMNA_DOCS_HELP_URL")
const SITE_NAME = env.getOrThrow("FRAMNA_DOCS_TITLE")

export default async function EncryptPage() {
    const possessiveName = SITE_NAME + (SITE_NAME.endsWith('s') ? "'" : "'s")
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
                    Use the form below to encrypt a secret using {possessiveName} public key.
                    <br/><br />
                    Authentication in remote specifications must be encrypted using {possessiveName} public key
                    before it is stored in a repository on GitHub.
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
