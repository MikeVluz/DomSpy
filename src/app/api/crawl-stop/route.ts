import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const body = await req.json();
  const { domainId } = body;

  const where = domainId ? { domainId, status: "running" } : { status: "running" };
  const updated = await prisma.crawlSession.updateMany({
    where,
    data: { status: "stopped", finishedAt: new Date() },
  });

  return NextResponse.json({ stopped: updated.count });
}
