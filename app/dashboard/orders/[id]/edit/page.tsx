"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const MAX_IMAGE_MB = 5
const MAX_VIDEO_MB = 50

export default function EditProductPage() {
  const supabase = createClient()
  const params = useParams()
  const router = useRouter()

  const productId = params.id as string

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [stock, setStock] = useState("")

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const [removeImageFlag, setRemoveImageFlag] = useState(false)
  const [removeVideoFlag, setRemoveVideoFlag] = useState(false)

  const [imageError, setImageError] = useState("")
  const [videoError, setVideoError] = useState("")
  const [formError, setFormError] = useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const imagePreview = useMemo(() => {
    return imageFile ? URL.createObjectURL(imageFile) : ""
  }, [imageFile])

  const videoPreview = useMemo(() => {
    return videoFile ? URL.createObjectURL(videoFile) : ""
  }, [videoFile])

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
      if (videoPreview) URL.revokeObjectURL(videoPreview)
    }
  }, [imagePreview, videoPreview])

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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setImageError("")

    if (!file) {
      setImageFile(null)
      return
    }

    const error = validateImage(file)
    if (error) {
      setImageFile(null)
      setImageError(error)
      return
    }

    setImageFile(file)
    setRemoveImageFlag(false)
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setVideoError("")

    if (!file) {
      setVideoFile(null)
      return
    }

    const error = validateVideo(file)
    if (error) {
      setVideoFile(null)
      setVideoError(error)
      return
    }

    setVideoFile(file)
    setRemoveVideoFlag(false)
  }

  function removeSelectedImage() {
    setImageFile(null)
    setImageError("")
  }

  function removeSelectedVideo() {
    setVideoFile(null)
    setVideoError("")
  }

  function markRemoveCurrentImage() {
    setRemoveImageFlag(true)
    setImageFile(null)
  }

  function markRemoveCurrentVideo() {
    setRemoveVideoFlag(true)
    setVideoFile(null)
  }

  function cancelRemoveCurrentImage() {
    setRemoveImageFlag(false)
  }

  function cancelRemoveCurrentVideo() {
    setRemoveVideoFlag(false)
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

  useEffect(() => {
    async function fetchProduct() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("User auth error:", userError)
        setFormError("You must be logged in.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("user_id", user.id)
        .single()

      if (error) {
        console.error("Error loading product:", error)
        setFormError("Could not load product.")
      } else if (data) {
        setName(data.name || "")
        setPrice(String(data.price ?? ""))
        setDescription(data.description || "")
        setCategory(data.category || "")
        setStock(String(data.stock ?? ""))
        setCurrentImageUrl(data.image_url || null)
        setCurrentVideoUrl(data.video_url || null)
      }

      setLoading(false)
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId, supabase])

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setFormError("")
    setImageError("")
    setVideoError("")

    try {
      if (!name.trim()) {
        setFormError("Product name is required.")
        setSaving(false)
        return
      }

      if (!price || Number(price) <= 0) {
        setFormError("Please enter a valid price.")
        setSaving(false)
        return
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setFormError("You must be logged in.")
        setSaving(false)
        return
      }

      let finalImageUrl = currentImageUrl
      let finalVideoUrl = currentVideoUrl

      if (removeImageFlag) {
        finalImageUrl = null
      }

      if (removeVideoFlag) {
        finalVideoUrl = null
      }

      if (imageFile) {
        finalImageUrl = await uploadFile("product-images", imageFile)
      }

      if (videoFile) {
        finalVideoUrl = await uploadFile("product-videos", videoFile)
      }

      const { error } = await supabase
        .from("products")
        .update({
          name: name.trim(),
          price: Number(price),
          stock: stock ? Number(stock) : 0,
          description: description.trim(),
          category: category.trim() || null,
          image_url: finalImageUrl,
          video_url: finalVideoUrl,
        })
        .eq("id", productId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Update error:", error)
        setFormError("Failed to update product.")
      } else {
        alert("Product updated successfully!")
        router.push("/dashboard/products")
      }
    } catch (err) {
      console.error("Update upload error:", err)
      setFormError("Update failed. Check storage buckets and policies.")
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-zinc-400">
        Loading product...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-3xl font-bold text-yellow-400">
        Edit Product
      </h1>

      <form
        onSubmit={handleUpdate}
        className="space-y-4 rounded-2xl border border-yellow-500/20 bg-zinc-950 p-6"
      >
        {formError ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {formError}
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
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-white">
              Current / New Photo
            </label>
            <span className="text-xs text-zinc-400">
              Max {MAX_IMAGE_MB}MB
            </span>
          </div>

          {currentImageUrl && !removeImageFlag && !imageFile ? (
            <div className="mb-4 rounded-xl border border-zinc-700 bg-black/30 p-3">
              <p className="mb-2 text-sm text-zinc-300">Current photo</p>
              <img
                src={currentImageUrl}
                alt="Current product"
                className="h-48 w-full rounded-lg object-cover"
              />
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={markRemoveCurrentImage}
                  className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400"
                >
                  Remove Current Photo
                </button>
              </div>
            </div>
          ) : null}

          {removeImageFlag ? (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              Current photo will be removed when you save.
              <div className="mt-3">
                <button
                  type="button"
                  onClick={cancelRemoveCurrentImage}
                  className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white"
                >
                  Undo Remove
                </button>
              </div>
            </div>
          ) : null}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-zinc-400"
          />

          {imageError ? (
            <p className="mt-2 text-sm text-red-400">{imageError}</p>
          ) : null}

          {imageFile ? (
            <div className="mt-4 rounded-xl border border-zinc-700 bg-black/30 p-3">
              <p className="mb-2 text-sm text-zinc-300">
                New selected photo: {imageFile.name}
              </p>

              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="New image preview"
                  className="h-48 w-full rounded-lg object-cover"
                />
              ) : null}

              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white"
                >
                  Remove Selected Photo
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-white">
              Current / New Video
            </label>
            <span className="text-xs text-zinc-400">
              Max {MAX_VIDEO_MB}MB
            </span>
          </div>

          {currentVideoUrl && !removeVideoFlag && !videoFile ? (
            <div className="mb-4 rounded-xl border border-zinc-700 bg-black/30 p-3">
              <p className="mb-2 text-sm text-zinc-300">Current video</p>
              <video
                src={currentVideoUrl}
                controls
                className="h-56 w-full rounded-lg bg-black object-cover"
              />
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={markRemoveCurrentVideo}
                  className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400"
                >
                  Remove Current Video
                </button>
              </div>
            </div>
          ) : null}

          {removeVideoFlag ? (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              Current video will be removed when you save.
              <div className="mt-3">
                <button
                  type="button"
                  onClick={cancelRemoveCurrentVideo}
                  className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white"
                >
                  Undo Remove
                </button>
              </div>
            </div>
          ) : null}

          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="w-full text-sm text-zinc-400"
          />

          {videoError ? (
            <p className="mt-2 text-sm text-red-400">{videoError}</p>
          ) : null}

          {videoFile ? (
            <div className="mt-4 rounded-xl border border-zinc-700 bg-black/30 p-3">
              <p className="mb-2 text-sm text-zinc-300">
                New selected video: {videoFile.name}
              </p>

              {videoPreview ? (
                <video
                  src={videoPreview}
                  controls
                  className="h-56 w-full rounded-lg bg-black object-cover"
                />
              ) : null}

              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={removeSelectedVideo}
                  className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white"
                >
                  Remove Selected Video
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[120px] w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {saving ? "Saving..." : "Update Product"}
        </button>
      </form>
    </div>
  )
}