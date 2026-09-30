import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

supabase.auth.onAuthStateChange((event, session) => {
  console.log("AUTH EVENT:", event, "session:", !!session);
});

async function run() {
  console.log("Signing up...");
  const email = "test" + Date.now() + "@university.edu.ng";
  const { data, error } = await supabase.auth.signUp({
    email,
    password: "Password123!",
  });
  console.log("Done signup. error:", !!error);
}

run();
setTimeout(() => process.exit(0), 3000);
