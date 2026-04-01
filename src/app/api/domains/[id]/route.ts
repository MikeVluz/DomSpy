import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole("viewer");
  if (error) return error;

  const { id } = await params;

  try {
    const domain = await prisma.domain.findUnique({
      where: { id },
      include: {
        pages: {
          include: {
            linksFrom: true,
            linksTo: true,
          },
        },
        crawls: {
          orderBy: { startedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!domain) {
      return NextResponse.json(
        { error: "Dominio nao encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(domain);
  } catch (error) {
    console.error("Get domain error:", error);
    return NextResponse.json(
      { error: "Erro: " + String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole("admin");
  if (error) return error;

  const { id } = await params;

  try {
    await prisma.domain.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete domain error:", error);
    return NextResponse.json(
      { error: "Erro: " + String(error) },
      { status: 500 }
    );
  }
}
