import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL environment variable");
}

if (!supabaseServiceKey && !supabaseAnonKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY environment variable"
  );
}

// Cliente com service key para operações administrativas
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Cliente com anon key para operações do usuário
export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
  }
);

