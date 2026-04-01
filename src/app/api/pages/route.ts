import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  const { error } = await requireRole("admin");
  if (error) return error;

  try {
    const body = await req.json();
    const { domainId, url, title, description, urls } = body;

    if (urls && Array.isArray(urls) && domainId) {
      const results = { added: 0, skipped: 0, errors: 0 };

      for (const rawUrl of urls) {
        const cleanUrl = rawUrl.trim();
        if (!cleanUrl) continue;

        try { new URL(cleanUrl); } catch { results.errors++; continue; }

        const existing = await prisma.page.findFirst({ where: { url: cleanUrl, domainId } });
        if (existing) { results.skipped++; continue; }

        await prisma.page.create({ data: { url: cleanUrl, domainId, updatedAt: new Date() } });
        results.added++;
      }

      return NextResponse.json(results, { status: 201 });
    }

    if (!domainId || !url) {
      return NextResponse.json({ error: "domainId e url sao obrigatorios" }, { status: 400 });
    }

    try { new URL(url); } catch { return NextResponse.json({ error: "URL invalida" }, { status: 400 }); }

    const existing = await prisma.page.findFirst({ where: { url, domainId } });
    if (existing) {
      return NextResponse.json({ error: "Esta pagina ja esta sendo monitorada" }, { status: 409 });
    }

    const page = await prisma.page.create({
      data: { url, domainId, title: title || null, description: description || null, updatedAt: new Date() },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Add page error:", error);
    return NextResponse.json({ error: "Erro: " + String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireRole("admin");
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("id");
    if (!pageId) return NextResponse.json({ error: "id e obrigatorio" }, { status: 400 });
    await prisma.page.delete({ where: { id: pageId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + String(error) }, { status: 500 });
  }
}
