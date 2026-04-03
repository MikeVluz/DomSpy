import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  const { error } = await requireRole("viewer");
  if (error) return error;

  const funnels = await prisma.funnel.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      pages: {
        include: { page: { select: { id: true, url: true, title: true, statusCode: true, responseTime: true, domainId: true, domain: { select: { name: true } } } } },
        orderBy: { position: "asc" },
      },
      linksFrom: { include: { toFunnel: { select: { id: true, name: true, color: true } } } },
      linksTo: { include: { fromFunnel: { select: { id: true, name: true, color: true } } } },
    },
  });

  return NextResponse.json(funnels);
}

export async function POST(req: NextRequest) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const body = await req.json();
  const { name, description, color } = body;
  if (!name) return NextResponse.json({ error: "Nome e obrigatorio" }, { status: 400 });

  const funnel = await prisma.funnel.create({
    data: { name, description: description || null, color: color || "#3B82F6" },
  });

  return NextResponse.json(funnel, { status: 201 });
}
