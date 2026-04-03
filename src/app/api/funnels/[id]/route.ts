import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole("viewer");
  if (error) return error;
  const { id } = await params;

  const funnel = await prisma.funnel.findUnique({
    where: { id },
    include: {
      pages: {
        include: { page: { include: { domain: { select: { id: true, name: true, url: true } }, linksFrom: { select: { href: true, statusCode: true, isExternal: true } }, groupMembers: { include: { group: true } } } } },
        orderBy: { position: "asc" },
      },
      linksFrom: { include: { toFunnel: { select: { id: true, name: true, color: true } } } },
      linksTo: { include: { fromFunnel: { select: { id: true, name: true, color: true } } } },
    },
  });

  if (!funnel) return NextResponse.json({ error: "Funil nao encontrado" }, { status: 404 });
  return NextResponse.json(funnel);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole("admin");
  if (error) return error;
  const { id } = await params;
  const body = await req.json();

  const funnel = await prisma.funnel.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.color !== undefined && { color: body.color }),
    },
  });

  return NextResponse.json(funnel);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole("admin");
  if (error) return error;
  const { id } = await params;

  await prisma.funnel.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
