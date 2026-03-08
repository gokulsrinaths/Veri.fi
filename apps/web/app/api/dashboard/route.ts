import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/store";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
