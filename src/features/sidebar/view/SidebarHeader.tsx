import Image from "next/image"
import { Stack } from "@mui/material"
import Link from "next/link"

export default function SidebarHeader() {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Link href={"/"}>
        <Image src="/duck.png" alt="Duck" width={40} height={45} priority={true}/>
      </Link>
    </Stack>
  )
}
