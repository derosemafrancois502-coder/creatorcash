"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface Idea {
id: number
text: string
}

export default function IdeasPage(){

const supabase = createClient()

const [ideas, setIdeas] = useState<Idea[]>([])
const [text, setText] = useState("")

useEffect(() => {
loadIdeas()
}, [])

async function loadIdeas(){

const { data } = await supabase
.from("ideas")
.select("*")
.order("id", { ascending: false })

if(data){
setIdeas(data)
}

}

async function addIdea(){

if(!text) return

await supabase
.from("ideas")
.insert({ text })

setText("")

loadIdeas()

}

async function deleteIdea(id:number){

await supabase
.from("ideas")
.delete()
.eq("id", id)

loadIdeas()

}

return(

<div>

<h1 className="title">
Ideas
</h1>

<div className="inputGroup">

<input
className="input"
value={text}
onChange={(e)=>setText(e.target.value)}
placeholder="New idea..."
/>

<button
onClick={addIdea}
className="button"
>
Add
</button>

</div>


<div>

{ideas.map((idea)=>(

<div
key={idea.id}
className="card"
>

<span>
{idea.text}
</span>


<button
onClick={()=>deleteIdea(idea.id)}
className="deleteButton"
>
Delete
</button>


</div>

))}

</div>


</div>

)

}