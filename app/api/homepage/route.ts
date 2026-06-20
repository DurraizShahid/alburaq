import { NextResponse } from "next/server"

import { buildHomepagePayload } from "@/lib/catalog"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("fragrances")
      .select(
        "fragella_id,slug,name,brand,primary_family,year,price,image_url,image_url_transparent,oil_type,longevity,sillage,rating,general_notes,main_accords,purchase_url"
      )
      .order("sort_score", { ascending: false })
      .order("rating", { ascending: false, nullsFirst: false })
      .limit(80)

    if (error) {
      if (error.code === "PGRST205") {
        return NextResponse.json({ empty: true, reason: "schema-missing" })
      }

      throw error
    }

    return NextResponse.json(buildHomepagePayload(data || []))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ empty: true, reason: message }, { status: 500 })
  }
}
