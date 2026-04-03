import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const body = await req.json();

  // Single page: { funnelId, pageId }
  // Bulk URLs: { funnelId, urls: string[] }
  if (body.urls && Array.isArray(body.urls) && body.funnelId) {
    let added = 0, skipped = 0;
    for (const url of body.urls) {
      const pages = await prisma.page.findMany({ where: { url: { contains: url.trim() } }, take: 1 });
      if (pages.length === 0) { skipped++; continue; }
      try {
        await prisma.funnelPage.create({ data: { funnelId: body.funnelId, pageId: pages[0].id } });
        added++;
      } catch { skipped++; }
    }
    return NextResponse.json({ added, skipped });
  }

  if (!body.funnelId || !body.pageId) return NextResponse.json({ error: "funnelId e pageId obrigatorios" }, { status: 400 });

  try {
    const fp = await prisma.funnelPage.create({ data: { funnelId: body.funnelId, pageId: body.pageId } });
    return NextResponse.json(fp, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Pagina ja esta neste funil" }, { status: 409 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const url = new URL(req.url);
  const funnelId = url.searchParams.get("funnelId");
  const pageId = url.searchParams.get("pageId");

  if (!funnelId || !pageId) return NextResponse.json({ error: "funnelId e pageId obrigatorios" }, { status: 400 });

  await prisma.funnelPage.deleteMany({ where: { funnelId, pageId } });
  return NextResponse.json({ ok: true });
}
