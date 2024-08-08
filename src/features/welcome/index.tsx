import { grey } from "@mui/material/colors"
import MessageLinkFooter from "@/common/ui/MessageLinkFooter"
import ShowSectionsLayer from "@/features/welcome/view/ShowSectionsLayer"
import WelcomeContent from "@/features/welcome/view/WelcomeContent"
import { env } from "@/common"
import { Box } from "@mui/material"

const HELP_URL = env.get("NEXT_PUBLIC_SHAPE_DOCS_HELP_URL")

const WelcomePage = () => {
  return (
    <>
      <ShowSectionsLayer />
      <WelcomeContent />

      {HELP_URL && 
        <Box
          position="absolute"
          sx={{ color: grey[500] }}
          bottom={30}
          marginLeft="auto"
        >
          <MessageLinkFooter
            url={`${HELP_URL}/Browsing-Documentation`}
            content="Lost? Read more about it in our wiki documentation"
          />
        </Box>
      }
    </>
  )
}

export default WelcomePage