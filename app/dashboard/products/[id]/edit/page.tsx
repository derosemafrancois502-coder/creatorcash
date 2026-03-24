"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function EditProductPage() {

  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const productId = params.id as string

  const [loading, setLoading] = useState(true)

  const [name,setName] = useState("")
  const [price,setPrice] = useState("")
  const [stock,setStock] = useState("")
  const [description,setDescription] = useState("")
  const [category,setCategory] = useState("")
  const [image,setImage] = useState("")
  const [video,setVideo] = useState("")

  useEffect(()=>{

    async function loadProduct(){

      const { data,error } = await supabase
        .from("products")
        .select("*")
        .eq("id",productId)
        .single()

      if(error){
        console.log(error)
        return
      }

      setName(data.name || "")
      setPrice(data.price || "")
      setStock(data.stock || "")
      setDescription(data.description || "")
      setCategory(data.category || "")
      setImage(data.image_url || "")
      setVideo(data.video_url || "")

      setLoading(false)

    }

    loadProduct()

  },[])

  async function updateProduct(){

    const { error } = await supabase
      .from("products")
      .update({
        name,
        price: Number(price),
        stock: Number(stock),
        description,
        category,
        image_url: image,
        video_url: video
      })
      .eq("id",productId)

    if(error){
      alert("Error updating product")
      console.log(error)
      return
    }

    alert("Product updated")

    router.push("/dashboard/products")

  }

  if(loading){

    return <div className="p-10 text-white">Loading...</div>

  }

  return(

<div className="max-w-3xl mx-auto p-10 text-white">

<h1 className="text-3xl mb-8 text-yellow-400">Edit Product</h1>

<div className="space-y-6">

<input
className="w-full p-3 bg-zinc-900 border border-zinc-700"
placeholder="Product name"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<input
className="w-full p-3 bg-zinc-900 border border-zinc-700"
placeholder="Price"
value={price}
onChange={(e)=>setPrice(e.target.value)}
/>

<input
className="w-full p-3 bg-zinc-900 border border-zinc-700"
placeholder="Stock"
value={stock}
onChange={(e)=>setStock(e.target.value)}
/>

<input
className="w-full p-3 bg-zinc-900 border border-zinc-700"
placeholder="Category"
value={category}
onChange={(e)=>setCategory(e.target.value)}
/>

<input
className="w-full p-3 bg-zinc-900 border border-zinc-700"
placeholder="Image URL"
value={image}
onChange={(e)=>setImage(e.target.value)}
/>

<input
className="w-full p-3 bg-zinc-900 border border-zinc-700"
placeholder="Video URL"
value={video}
onChange={(e)=>setVideo(e.target.value)}
/>

<textarea
className="w-full p-3 bg-zinc-900 border border-zinc-700"
placeholder="Description"
value={description}
onChange={(e)=>setDescription(e.target.value)}
/>

<button
onClick={updateProduct}
className="bg-yellow-500 text-black px-6 py-3 rounded"
>

Update Product

</button>

</div>

</div>

)

}