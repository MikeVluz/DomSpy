import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";

export async function GET() {
  const { error } = await requireRole("super_admin");
  if (error) return error;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireRole("super_admin");
  if (error) return error;

  try {
    const { email, password, name, role, status } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, senha e nome sao obrigatorios" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email ja cadastrado" }, { status: 409 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: role || "viewer", status: status || "active" },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + String(error) }, { status: 500 });
  }
}
