import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!["admin", "personal", "aluno"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 10 é o custo (tempo de cálculo)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // salva o hash, não a senha pura
        role,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
