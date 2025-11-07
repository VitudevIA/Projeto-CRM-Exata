import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Logs para debug (sem expor valores sensíveis)
console.log("Supabase config check:", {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  hasAnonKey: !!supabaseAnonKey,
  urlLength: supabaseUrl?.length || 0,
});

if (!supabaseUrl) {
  const error = "Missing SUPABASE_URL environment variable";
  console.error(error);
  throw new Error(error);
}

if (!supabaseServiceKey && !supabaseAnonKey) {
  const error = "Missing SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY environment variable";
  console.error(error);
  throw new Error(error);
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

