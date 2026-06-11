import { createClient } from "@supabase/supabase-js";
// import * as dotenv from "dotenv/config";
import * as path from "path";

// dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabase credentials in env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching drills from supabase...");
    const { data: drills, error } = await supabase
        .from("drills")
        .select(`
            id,
            drill_name,
            helpful_count,
            not_helpful_count,
            template_id,
            drill_templates(
                id,
                name,
                helpful_count,
                not_helpful_count
            )
        `);

    if (error) {
        console.error("Error fetching drills:", error);
        return;
    }

    console.log("Total drills found:", drills.length);
    console.log("Drills data:");
    console.dir(drills, { depth: null });
}

run();
