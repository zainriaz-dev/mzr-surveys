import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureIndexes } from "@/lib/mongodb";
import { Parser } from "json2csv";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "json";
  await ensureIndexes();
  const db = await getDb();
  const docs = await db.collection("responses").find({}).toArray();

  if (format === "csv") {
    const parser = new Parser();
    const csv = parser.parse(docs);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=responses_${Date.now()}.csv`,
      },
    });
  }

  return NextResponse.json({ ok: true, data: docs });
}


