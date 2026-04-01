import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const { pageId, alertType, domainId } = await req.json();
    if (!pageId || !alertType || !domainId) {
      return NextResponse.json({ error: "pageId, alertType e domainId sao obrigatorios" }, { status: 400 });
    }
    await prisma.dismissedAlert.upsert({
      where: { userId_pageId_alertType: { userId: session!.user.id, pageId, alertType } },
      update: { dismissedAt: new Date() },
      create: { userId: session!.user.id, pageId, alertType, domainId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("pageId");
    const alertType = searchParams.get("alertType");
    if (!pageId || !alertType) {
      return NextResponse.json({ error: "pageId e alertType sao obrigatorios" }, { status: 400 });
    }
    await prisma.dismissedAlert.deleteMany({ where: { userId: session!.user.id, pageId, alertType } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + String(error) }, { status: 500 });
  }
}
