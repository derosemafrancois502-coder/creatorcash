"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function CustomersPage() {

const supabase = createClient()

const [customers, setCustomers] = useState<any[]>([])
const [email, setEmail] = useState("")
const [name, setName] = useState("")

useEffect(() => {
loadCustomers()
}, [])

async function loadCustomers() {

const { data, error } = await supabase
.from("customers")
.select("*")
.order("created_at", { ascending: false })

if (!error) setCustomers(data || [])

}

async function addCustomer() {

const { data: { user } } = await supabase.auth.getUser()

await supabase.from("customers").insert({
user_id: user?.id,
email,
name
})

setEmail("")
setName("")
loadCustomers()

}

return (

<div>

<h1>Customers</h1>

<input
placeholder="Name"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<button onClick={addCustomer}>
Add
</button>

{customers.map(c=>(
<div key={c.id}>
{c.name} - {c.email}
</div>
))}

</div>

)

}
