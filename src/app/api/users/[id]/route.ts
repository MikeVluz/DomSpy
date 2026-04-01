import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireRole("super_admin");
  if (error) return error;
  const { id } = await params;

  try {
    const { role, status } = await req.json();
    if (role && session!.user.id === id) {
      return NextResponse.json({ error: "Nao pode alterar seu proprio nivel" }, { status: 400 });
    }
    const updateData: Record<string, string> = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireRole("super_admin");
  if (error) return error;
  const { id } = await params;

  if (session!.user.id === id) {
    return NextResponse.json({ error: "Nao pode excluir sua propria conta" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + String(error) }, { status: 500 });
  }
}
