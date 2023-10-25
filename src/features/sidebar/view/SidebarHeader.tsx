import Image from "next/image"
import { Stack } from "@mui/material"

export default function SidebarHeader() {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Image src="/duck.png" alt="Duck" width={40} height={45} priority={true}/>
    </Stack>
  )
}