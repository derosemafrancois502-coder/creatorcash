"use client";

import { useState } from "react";
import { supabase } from "../supabase";

export default function LoginPage() {

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

async function signUp() {

const { error } = await supabase.auth.signUp({
email: email,
password: password,
});

if (error) {
alert("Error: " + error.message);
} else {
alert("User created successfully");
}

}

return (
<div>

<input
type="email"
placeholder="Email"
onChange={(e) => setEmail(e.target.value)}
/>

<input
type="password"
placeholder="Password"
onChange={(e) => setPassword(e.target.value)}
/>

<button onClick={signUp}>
Sign Up
</button>

</div>
);
}
