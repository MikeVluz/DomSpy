import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const { fromFunnelId, toFunnelId } = await req.json();
  if (!fromFunnelId || !toFunnelId) return NextResponse.json({ error: "IDs obrigatorios" }, { status: 400 });
  if (fromFunnelId === toFunnelId) return NextResponse.json({ error: "Nao pode linkar a si mesmo" }, { status: 400 });

  try {
    const link = await prisma.funnelLink.create({ data: { fromFunnelId, toFunnelId } });
    return NextResponse.json(link, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Link ja existe" }, { status: 409 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatorio" }, { status: 400 });

  await prisma.funnelLink.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
