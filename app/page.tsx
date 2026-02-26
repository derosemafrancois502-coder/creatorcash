"use client";

import { useState, useEffect } from "react";

export default function Home() {

const [ideas, setIdeas] = useState<string[]>([]);
const [input, setInput] = useState("");
const [editIndex, setEditIndex] = useState<number | null>(null);

useEffect(() => {
const saved = localStorage.getItem("ideas");
if (saved) setIdeas(JSON.parse(saved));
}, []);

useEffect(() => {
localStorage.setItem("ideas", JSON.stringify(ideas));
}, [ideas]);

function saveIdea() {

if (!input.trim()) return;

if (editIndex !== null) {

const updated = [...ideas];
updated[editIndex] = input;
setIdeas(updated);
setEditIndex(null);

} else {

setIdeas([...ideas, input]);

}

setInput("");

}

function deleteIdea(index:number) {

const updated = ideas.filter((_, i) => i !== index);
setIdeas(updated);

}

function editIdea(index:number) {

setInput(ideas[index]);
setEditIndex(index);

}

return (

<main style={{
padding:"20px",
maxWidth:"500px",
margin:"auto",
fontFamily:"Arial"
}}>

<h1>CreatorCash</h1>

<input
value={input}
onChange={(e)=>setInput(e.target.value)}
placeholder="Enter your idea"
style={{
padding:"10px",
width:"100%",
marginBottom:"10px"
}}
/>

<button
onClick={saveIdea}
style={{
padding:"10px",
width:"100%",
background:"black",
color:"white"
}}
>

{editIndex !== null ? "Update" : "Save"}

</button>

<hr style={{margin:"20px 0"}}/>

{ideas.map((idea,index)=>(

<div key={index}
style={{
border:"1px solid #ddd",
padding:"10px",
marginBottom:"10px",
borderRadius:"8px"
}}>

<p>{idea}</p>

<button onClick={()=>editIdea(index)}>
Edit
</button>

<button
onClick={()=>deleteIdea(index)}
style={{marginLeft:"10px"}}
>
Delete
</button>

</div>

))}

</main>

);

}