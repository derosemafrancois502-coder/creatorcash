"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useParams } from "next/navigation"

export default function PublicProfile(){

const params = useParams()

const userId = params?.id as string

const [links, setLinks] = useState<any[]>([])

const supabase = createClient()

useEffect(()=>{

if(userId){

loadLinks(userId)

}

},[userId])

async function loadLinks(id:string){

const { data } = await supabase

.from("links")

.select("*")

.eq("user_id", id)

setLinks(data || [])

}

return(

<div style={main}>

<h1>User Profile</h1>

{links.map((link,index)=>(

<div key={index}>

{link.url}

</div>

))}

</div>

)

}

const main = {

background:"black",

color:"gold",

minHeight:"100vh",

padding:"40px"

}