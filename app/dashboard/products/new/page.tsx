"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const MAX_IMAGE_MB = 5
const MAX_VIDEO_MB = 50

export default function NewProductPage() {
  const supabase = createClient()
  const router = useRouter()

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [stock, setStock] = useState("")

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  function validateImage(file: File) {
    if (!file.type.startsWith("image/")) {
      return "Please upload a valid image file."
    }

    const maxBytes = MAX_IMAGE_MB * 1024 * 1024
    if (file.size > maxBytes) {
      return `Image must be ${MAX_IMAGE_MB}MB or smaller.`
    }

    return ""
  }

  function validateVideo(file: File) {
    if (!file.type.startsWith("video/")) {
      return "Please upload a valid video file."
    }

    const maxBytes = MAX_VIDEO_MB * 1024 * 1024
    if (file.size > maxBytes) {
      return `Video must be ${MAX_VIDEO_MB}MB or smaller.`
    }

    return ""
  }

  async function uploadFile(bucket: string, file: File) {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    try {
      if (!name.trim()) {
        setErrorMessage("Product name is required.")
        setLoading(false)
        return
      }

      if (!price || Number(price) <= 0) {
        setErrorMessage("Please enter a valid price.")
        setLoading(false)
        return
      }

      if (imageFile) {
        const imageError = validateImage(imageFile)
        if (imageError) {
          setErrorMessage(imageError)
          setLoading(false)
          return
        }
      }

      if (videoFile) {
        const videoError = validateVideo(videoFile)
        if (videoError) {
          setErrorMessage(videoError)
          setLoading(false)
          return
        }
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setErrorMessage("You must be logged in.")
        setLoading(false)
        return
      }

      let imageUrl: string | null = null
      let videoUrl: string | null = null

      if (imageFile) {
        imageUrl = await uploadFile("product-images", imageFile)
      }

      if (videoFile) {
        videoUrl = await uploadFile("product-videos", videoFile)
      }

      const { error } = await supabase.from("products").insert([
        {
          user_id: user.id,
          name: name.trim(),
          price: Number(price),
          stock: stock ? Number(stock) : 0,
          description: description.trim(),
          category: category.trim() || null,
          image_url: imageUrl,
          video_url: videoUrl,
        },
      ])

      if (error) {
        console.error("Insert error:", error)
        setErrorMessage("Failed to add product.")
      } else {
        alert("Product added successfully!")
        router.push("/dashboard/products")
      }
    } catch (error) {
      console.error("Upload/Create error:", error)
      setErrorMessage("Something went wrong while creating the product.")
    }

    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">Add Product</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Create a new product for your CreatorGoat shop.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-yellow-500/20 bg-zinc-950 p-6"
      >
        {errorMessage ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {errorMessage}
          </div>
        ) : null}

        <input
          type="text"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
          required
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
          required
        />

        <input
          type="number"
          min="0"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
        />

        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <label className="mb-2 block text-sm font-medium text-white">
            Upload Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-zinc-400"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Max {MAX_IMAGE_MB}MB
          </p>
        </div>

        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <label className="mb-2 block text-sm font-medium text-white">
            Upload Video
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-zinc-400"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Max {MAX_VIDEO_MB}MB
          </p>
        </div>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[140px] w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Creating..." : "Add Product"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/products")}
            className="rounded-lg border border-zinc-700 px-6 py-3 text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}