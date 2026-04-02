import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const { error } = await requireRole("viewer");
  if (error) return error;

  const domainId = req.nextUrl.searchParams.get("domainId");
  if (!domainId) return NextResponse.json({ error: "domainId obrigatorio" }, { status: 400 });

  try {
    const groups = await prisma.pageGroup.findMany({
      where: { domainId },
      include: { pages: { include: { page: { select: { id: true, url: true, title: true } } } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireRole("admin");
  if (error) return error;

  try {
    const { name, color, domainId } = await req.json();
    if (!name || !domainId) return NextResponse.json({ error: "name e domainId obrigatorios" }, { status: 400 });

    const count = await prisma.pageGroup.count({ where: { domainId } });
    if (count >= 50) return NextResponse.json({ error: "Limite de 50 grupos atingido" }, { status: 400 });

    const group = await prisma.pageGroup.create({ data: { name, color: color || "#3B82F6", domainId } });
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + String(error) }, { status: 500 });
  }
}
