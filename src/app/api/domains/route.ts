import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  const { error } = await requireRole("viewer");
  if (error) return error;

  try {
    const domains = await prisma.domain.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { pages: true } },
        crawls: {
          orderBy: { startedAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(domains);
  } catch (error) {
    console.error("List domains error:", error);
    return NextResponse.json(
      { error: "Erro ao listar dominios: " + String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireRole("admin");
  if (error) return error;

  try {
    const body = await req.json();
    const { url, name } = body;

    if (!url || !name) {
      return NextResponse.json(
        { error: "URL e nome sao obrigatorios" },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "URL invalida" }, { status: 400 });
    }

    const domain = await prisma.domain.create({
      data: { url, name },
    });

    return NextResponse.json(domain, { status: 201 });
  } catch (error) {
    console.error("Create domain error:", error);
    return NextResponse.json(
      { error: "Erro ao criar dominio: " + String(error) },
      { status: 500 }
    );
  }
}
