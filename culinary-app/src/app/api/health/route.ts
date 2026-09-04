import { NextResponse } from "next/server";
import { getNotionConfig } from "@/lib/notion/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liveness/readiness. Nunca chama o Notion. Sem config -> degraded, mas HTTP
 * 200 (health não falha por falta de config; sinaliza no corpo).
 */
export function GET() {
  const configurado = getNotionConfig() !== null;
  return NextResponse.json(
    {
      status: configurado ? "ok" : "degraded",
      notionConfigured: configurado,
      time: new Date().toISOString(),
    },
    { status: 200 },
  );
}
