import { createClient } from "@supabase/supabase-js"
import ws from "ws"

// Node 20 in this workspace does not expose WebSocket globally for supabase-js.
if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = ws as typeof globalThis.WebSocket
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase server environment variables.")
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
