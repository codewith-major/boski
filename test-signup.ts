import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const email = "test" + Date.now() + "@university.edu.ng";
  const { data, error } = await supabase.auth.signUp({
    email,
    password: "Password123!",
    options: {
      data: { display_name: "Test User" }
    }
  });

  console.log("SIGNUP RESULT:");
  console.log("error:", !!error);
  if (error) console.log("error message:", error.message);
  console.log("user exists:", !!data?.user);
  console.log("session exists:", !!data?.session);
  console.log("user id:", data?.user?.id);
  console.log("identities:", data?.user?.identities?.length);
}

run();
