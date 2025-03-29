import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logout realizado com sucesso" });

  // Apaga o cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0), // expira imediatamente
    path: "/"
  });

  return response;
}