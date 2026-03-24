"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Subscribe() {

const supabase = createClient();
const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
async function getUser() {
const { data } = await supabase.auth.getUser();
setUserId(data.user?.id ?? null);
}

getUser();
}, []);

async function buy(priceId: string) {

if (!userId) {
alert("User not loaded");
return;
}

const res = await fetch("/api/checkout", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({ priceId, userId }),
});

const data = await res.json();

if (data.url) {
window.location.href = data.url;
} else {
alert("Checkout failed");
}
}

return (
<div>
<h1>Choose Plan</h1>

<button onClick={() => buy("price_1T6sMYCBfICWM4G19qBeeLsL")}>
Basic - $9
</button>

<button onClick={() => buy("price_1T6sP1CBfICWM4G1jabKOSzA")}>
Pro - $19
</button>

<button onClick={() => buy("price_1T6sRMCBfICWM4G1kKHNACty")}>
Elite - $29
</button>
</div>
);
}
