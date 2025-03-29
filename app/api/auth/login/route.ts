import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Segredo para assinar o token (guarde no .env depois)
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatórios" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const senhaOk = await bcrypt.compare(password, user.password);
    if (!senhaOk) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    // Gerar o token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Retornar resposta com cookie HttpOnly
    const response = NextResponse.json({
      message: "Login feito com sucesso",
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 1, // 7 dias
      path: "/"
    });

    return response;

  } catch (err) {
    console.error("Erro no login:", err);
    return NextResponse.json({ error: "Erro interno no login" }, { status: 500 });
  }
}

