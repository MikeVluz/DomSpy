import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { crawlDomain } from "@/lib/crawler";
import { requireRole } from "@/lib/auth-helpers";

export const maxDuration = 300;

export async function POST() {
  const { error } = await requireRole("admin");
  if (error) return error;

  const domains = await prisma.domain.findMany();
  const results: { domainId: string; name: string; status: string }[] = [];

  for (const domain of domains) {
    const running = await prisma.crawlSession.findFirst({ where: { domainId: domain.id, status: "running" } });
    if (running) {
      results.push({ domainId: domain.id, name: domain.name, status: "already_running" });
      continue;
    }
    try {
      await crawlDomain(domain.id, domain.url);
      results.push({ domainId: domain.id, name: domain.name, status: "completed" });
    } catch (e) {
      results.push({ domainId: domain.id, name: domain.name, status: "failed" });
    }
  }

  return NextResponse.json({ results });
}
