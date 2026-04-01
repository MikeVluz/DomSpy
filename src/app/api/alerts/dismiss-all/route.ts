import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const { domainId, alertType } = await req.json();
    if (!domainId || !alertType) {
      return NextResponse.json({ error: "domainId e alertType sao obrigatorios" }, { status: 400 });
    }

    const pages = await prisma.page.findMany({
      where: { domainId },
      select: { id: true, statusCode: true, responseTime: true },
    });

    const pagesToDismiss = pages.filter((p) => {
      if (alertType === "broken_link") return p.statusCode !== null && (p.statusCode === 0 || p.statusCode >= 400);
      if (alertType === "slow_page") return p.responseTime !== null && p.responseTime > 3000;
      return false;
    });

    for (const page of pagesToDismiss) {
      await prisma.dismissedAlert.upsert({
        where: { userId_pageId_alertType: { userId: session!.user.id, pageId: page.id, alertType } },
        update: { dismissedAt: new Date() },
        create: { userId: session!.user.id, pageId: page.id, alertType, domainId },
      });
    }

    return NextResponse.json({ success: true, dismissed: pagesToDismiss.length });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + String(error) }, { status: 500 });
  }
}
