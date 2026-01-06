import { NextResponse } from "next/server"

export const GET = async (): Promise<NextResponse> => {
  return NextResponse.json({ status: "Healthy" })
}


let foo = "bar"



