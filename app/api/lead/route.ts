import { createClient } from "../../../lib/supabase/client";

export async function POST(req: Request) {
try {
const supabase = createClient();
const body = await req.json();

const { error } = await supabase
.from("leads")
.insert({
email: body.email,
user_id: body.user_id
});

if (error) {
console.error(error);
return Response.json({ error: "Database error" }, { status: 500 });
}

return Response.json({ success: true });
} catch (err) {
console.error(err);
return Response.json({ error: "Server error" }, { status: 500 });
}
}
