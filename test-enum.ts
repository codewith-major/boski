import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function run() {
  const { data, error } = await supabase.auth.signUp({
    email: "test@university.edu.ng", // Likely already used
    password: "Password123!",
  });

  console.log("error:", !!error);
  if (error) console.log("message:", error.message);
  console.log("user:", !!data?.user);
  if (data?.user) console.log("is_fake:", data.user.identities?.length === 0);
}

run();
