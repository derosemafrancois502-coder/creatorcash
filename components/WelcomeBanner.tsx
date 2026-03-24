"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function WelcomeBanner() {

const supabase = createClient()

const [name, setName] = useState("Creator")


useEffect(() => {

async function getUser() {

const { data } = await supabase.auth.getUser()

if (data.user?.email) {

const username = data.user.email.split("@")[0]

setName(username)

}

}

getUser()

}, [])


return (

<div style={banner}>

<h2 style={title}>
Welcome back, {name} 👑
</h2>

<p style={subtitle}>
Your empire is growing.
</p>

</div>

)

}


const banner: React.CSSProperties = {

border: "2px solid gold",

padding: "20px",

borderRadius: "12px",

textAlign: "center",

backgroundColor: "#000",

maxWidth: "600px",

margin: "auto",

marginBottom: "40px"

}


const title: React.CSSProperties = {

color: "gold",

marginBottom: "10px"

}


const subtitle: React.CSSProperties = {

color: "#ccc"

}
