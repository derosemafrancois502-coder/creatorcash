"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  Barcode,
  Image as ImageIcon,
  Package,
  Plus,
  Save,
  Tag,
  Video,
  X,
  Store,
  Upload,
  Truck,
  Ruler,
  Weight,
} from "lucide-react"

type ProductType = "physical" | "digital"
type ProductStatus = "draft" | "published"
type WeightUnit = "lb" | "oz" | "g" | "kg"
type DistanceUnit = "in" | "cm"

const categoryOptions = [
  "Beauty",
  "Fashion",
  "Digital",
  "Fitness",
  "Tech",
  "Lifestyle",
  "Home",
  "Kitchen",
  "Men",
  "Outdoor",
]

export default function SellerNewProductPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [compareAtPrice, setCompareAtPrice] = useState("")
  const [inventoryCount, setInventoryCount] = useState("0")
  const [category, setCategory] = useState("Beauty")
  const [type, setType] = useState<ProductType>("physical")
  const [status, setStatus] = useState<ProductStatus>("draft")

  const [imageUrl, setImageUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")

  const [sku, setSku] = useState("")
  const [barcode, setBarcode] = useState("")

  const [colorInput, setColorInput] = useState("")
  const [sizeInput, setSizeInput] = useState("")
  const [colors, setColors] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])

  const [weight, setWeight] = useState("")
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("lb")
  const [length, setLength] = useState("")
  const [width, setWidth] = useState("")
  const [height, setHeight] = useState("")
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>("in")

  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState("")

  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  function addColor() {
    const next = colorInput.trim()
    if (!next) return
    if (colors.includes(next)) {
      setColorInput("")
      return
    }
    setColors((prev) => [...prev, next])
    setColorInput("")
  }

  function addSize() {
    const next = sizeInput.trim().toUpperCase()
    if (!next) return
    if (sizes.includes(next)) {
      setSizeInput("")
      return
    }
    setSizes((prev) => [...prev, next])
    setSizeInput("")
  }

  function removeColor(value: string) {
    setColors((prev) => prev.filter((item) => item !== value))
  }

  function removeSize(value: string) {
    setSizes((prev) => prev.filter((item) => item !== value))
  }

  function clearMediaState() {
    photoPreviews.forEach((url) => URL.revokeObjectURL(url))
    if (videoPreview) URL.revokeObjectURL(videoPreview)

    setPhotoFiles([])
    setPhotoPreviews([])
    setVideoFile(null)
    setVideoPreview("")

    if (photoInputRef.current) photoInputRef.current.value = ""
    if (videoInputRef.current) videoInputRef.current.value = ""
  }

  function clearForm() {
    setName("")
    setDescription("")
    setPrice("")
    setCompareAtPrice("")
    setInventoryCount("0")
    setCategory("Beauty")
    setType("physical")
    setStatus("draft")
    setImageUrl("")
    setVideoUrl("")
    setSku("")
    setBarcode("")
    setColorInput("")
    setSizeInput("")
    setColors([])
    setSizes([])
    setWeight("")
    setWeightUnit("lb")
    setLength("")
    setWidth("")
    setHeight("")
    setDistanceUnit("in")
    clearMediaState()
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, 5)

    photoPreviews.forEach((url) => URL.revokeObjectURL(url))

    setPhotoFiles(files)
    setPhotoPreviews(files.map((file) => URL.createObjectURL(file)))
  }

  function handleVideoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null

    if (videoPreview) URL.revokeObjectURL(videoPreview)

    setVideoFile(file)
    setVideoPreview(file ? URL.createObjectURL(file) : "")
  }

  function removePhoto(index: number) {
    const nextFiles = [...photoFiles]
    const nextPreviews = [...photoPreviews]

    const removedPreview = nextPreviews[index]
    if (removedPreview) URL.revokeObjectURL(removedPreview)

    nextFiles.splice(index, 1)
    nextPreviews.splice(index, 1)

    setPhotoFiles(nextFiles)
    setPhotoPreviews(nextPreviews)
  }

  function removeVideo() {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoFile(null)
    setVideoPreview("")
    if (videoInputRef.current) videoInputRef.current.value = ""
  }

  async function uploadFileToStorage(file: File, folder: string, userId: string) {
    const cleanName = file.name.replace(/\s+/g, "-").toLowerCase()
    const path = `${userId}/${folder}/${Date.now()}-${cleanName}`

    const { error } = await supabase.storage
      .from("product-media")
      .upload(path, file, { upsert: true })

    if (error) {
      throw new Error(error.message)
    }

    const { data } = supabase.storage.from("product-media").getPublicUrl(path)
    return data.publicUrl
  }

  async function resolveMediaUrls(userId: string) {
    let resolvedImageUrl = imageUrl.trim() || null
    let resolvedVideoUrl = videoUrl.trim() || null

    if (photoFiles.length > 0) {
      resolvedImageUrl = await uploadFileToStorage(photoFiles[0], "images", userId)
    }

    if (videoFile) {
      resolvedVideoUrl = await uploadFileToStorage(videoFile, "videos", userId)
    }

    return {
      image_url: resolvedImageUrl,
      video_url: resolvedVideoUrl,
    }
  }

  async function handleSaveProduct() {
    const cleanName = name.trim()
    const cleanDescription = description.trim()
    const cleanSku = sku.trim()
    const cleanBarcode = barcode.trim()

    const numericPrice = Number(price)
    const numericCompareAtPrice = compareAtPrice ? Number(compareAtPrice) : null
    const numericInventory = type === "physical" ? Number(inventoryCount || 0) : 0

    const numericWeight = weight ? Number(weight) : null
    const numericLength = length ? Number(length) : null
    const numericWidth = width ? Number(width) : null
    const numericHeight = height ? Number(height) : null

    if (!cleanName) {
      alert("Please enter a product name.")
      return
    }

    if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) {
      alert("Please enter a valid price.")
      return
    }

    if (
      numericCompareAtPrice !== null &&
      (Number.isNaN(numericCompareAtPrice) || numericCompareAtPrice < numericPrice)
    ) {
      alert("Compare at price must be greater than or equal to the product price.")
      return
    }

    if (type === "physical" && (Number.isNaN(numericInventory) || numericInventory < 0)) {
      alert("Inventory cannot be negative.")
      return
    }

    if (photoFiles.length > 5) {
      alert("You can upload a maximum of 5 photos.")
      return
    }

    if (type === "physical") {
      if (!weight || numericWeight === null || Number.isNaN(numericWeight) || numericWeight <= 0) {
        alert("Please enter a valid shipping weight.")
        return
      }

      if (!length || numericLength === null || Number.isNaN(numericLength) || numericLength <= 0) {
        alert("Please enter a valid package length.")
        return
      }

      if (!width || numericWidth === null || Number.isNaN(numericWidth) || numericWidth <= 0) {
        alert("Please enter a valid package width.")
        return
      }

      if (!height || numericHeight === null || Number.isNaN(numericHeight) || numericHeight <= 0) {
        alert("Please enter a valid package height.")
        return
      }
    }

    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Please sign in first.")
        return
      }

      const { data: shopRows, error: shopError } = await supabase
        .from("shops")
        .select("id, approved, status")
        .eq("user_id", user.id)
        .limit(1)

      if (shopError) {
        console.error(shopError)
        alert("Could not verify your seller shop.")
        return
      }

      const shopRow = shopRows?.[0]

      if (!shopRow?.id) {
        alert("No seller shop found for this account.")
        return
      }

      const media = await resolveMediaUrls(user.id)

      const payload = {
        user_id: user.id,
        shop_id: shopRow.id,
        name: cleanName,
        description: cleanDescription || null,
        price: numericPrice,
        compare_at_price: numericCompareAtPrice,
        inventory_count: numericInventory,
        category: category || null,
        type,
        status,
        image_url: media.image_url,
        video_url: media.video_url,
        sku: cleanSku || null,
        barcode: cleanBarcode || null,
        colors: colors.length > 0 ? colors : null,
        sizes: sizes.length > 0 ? sizes : null,
        weight: type === "physical" ? numericWeight : null,
        weight_unit: type === "physical" ? weightUnit : null,
        length: type === "physical" ? numericLength : null,
        width: type === "physical" ? numericWidth : null,
        height: type === "physical" ? numericHeight : null,
        distance_unit: type === "physical" ? distanceUnit : null,
        published_at: status === "published" ? new Date().toISOString() : null,
      }

      const { error } = await supabase.from("products").insert(payload)

      if (error) {
        console.error(error)
        alert(error.message)
        return
      }

      alert(status === "published" ? "Product published." : "Product saved as draft.")
      clearForm()
      router.push("/dashboard/seller")
    } catch (error) {
      console.error(error)
      alert(
        "Could not save product. Make sure the 'product-media' storage bucket exists."
      )
    } finally {
      setLoading(false)
    }
  }

  const previewImage = photoPreviews[0] || imageUrl || ""
  const previewVideo = videoPreview || videoUrl || ""

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/dashboard/seller"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Seller Dashboard
          </Link>

          <button
            type="button"
            onClick={handleSaveProduct}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-600/80">
            CreatorGoat
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950 md:text-5xl">
            Add New Product
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500 md:text-base">
            Create a new marketplace product with media, category, barcode, SKU,
            sizes, colors, and shipping details for label generation.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100">
                  <Package className="h-5 w-5 text-zinc-900" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950">
                    Product Basics
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Core information for this listing.
                  </p>
                </div>
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter product name"
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write product description..."
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800">
                      Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800">
                      Compare At Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      placeholder="Optional old price"
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800">
                      Product Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as ProductType)}
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                    >
                      <option value="physical">Physical</option>
                      <option value="digital">Digital</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                    >
                      {categoryOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {type === "physical" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800">
                      Inventory Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={inventoryCount}
                      onChange={(e) => setInventoryCount(e.target.value)}
                      placeholder="0"
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                    />
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100">
                  <Barcode className="h-5 w-5 text-zinc-900" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950">
                    Product Identification
                  </h2>
                  <p className="text-sm text-zinc-500">
                    SKU and barcode for inventory and product tracking.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Example: CG-SHIRT-BLK-L"
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Barcode / UPC / EAN
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Enter barcode number"
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100">
                  <Tag className="h-5 w-5 text-zinc-900" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950">
                    Variants
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Add colors and sizes for customer selection.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Colors
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addColor()
                        }
                      }}
                      placeholder="Black"
                      className="h-12 flex-1 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={addColor}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {colors.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {colors.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => removeColor(item)}
                          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700"
                        >
                          {item}
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-800">
                    Sizes
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addSize()
                        }
                      }}
                      placeholder="S"
                      className="h-12 flex-1 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={addSize}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {sizes.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sizes.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => removeSize(item)}
                          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700"
                        >
                          {item}
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            {type === "physical" ? (
              <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100">
                    <Truck className="h-5 w-5 text-zinc-900" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-950">
                      Shipping Details
                    </h2>
                    <p className="text-sm text-zinc-500">
                      Required for shipping and label generation.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800">
                      Weight
                    </label>
                    <div className="relative">
                      <Weight className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="2"
                        className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800">
                      Weight Unit
                    </label>
                    <select
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                    >
                      <option value="lb">lb</option>
                      <option value="oz">oz</option>
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800">
                      Length
                    </label>
                    <div className="relative">
                      <Ruler className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        placeholder="10"
                        className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800">
                      Width
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="8"
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800">
                      Height
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="4"
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-800">
                      Distance Unit
                    </label>
                    <select
                      value={distanceUnit}
                      onChange={(e) => setDistanceUnit(e.target.value as DistanceUnit)}
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
                    >
                      <option value="in">in</option>
                      <option value="cm">cm</option>
                    </select>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100">
                  <ImageIcon className="h-5 w-5 text-zinc-900" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950">Media</h2>
                  <p className="text-sm text-zinc-500">
                    Upload up to 5 photos and 1 video.
                  </p>
                </div>
              </div>

              <div className="grid gap-5">
                <div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photos
                  </button>

                  <p className="mt-2 text-xs text-zinc-500">
                    Maximum 5 photos. First photo becomes the main image.
                  </p>

                  {photoPreviews.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {photoPreviews.map((preview, index) => (
                        <div
                          key={preview}
                          className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50"
                        >
                          <img
                            src={preview}
                            alt={`Product preview ${index + 1}`}
                            className="h-28 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="px-3 py-2 text-[11px] text-zinc-600">
                            {index === 0 ? "Main image" : `Photo ${index + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : imageUrl ? (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                      <img
                        src={imageUrl}
                        alt="Current image"
                        className="h-40 w-full object-cover"
                      />
                      <div className="px-3 py-2 text-[11px] text-zinc-600">
                        Current image URL preview
                      </div>
                    </div>
                  ) : null}
                </div>

                <div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Video
                  </button>

                  <p className="mt-2 text-xs text-zinc-500">
                    Maximum 1 video. Uploaded video becomes the main product video.
                  </p>

                  {videoPreview ? (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                      <video src={videoPreview} controls className="h-56 w-full object-cover" />
                      <div className="flex items-center justify-between px-3 py-2 text-[11px] text-zinc-600">
                        <span>New uploaded video</span>
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="inline-flex items-center gap-1 text-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : videoUrl ? (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                      <video src={videoUrl} controls className="h-56 w-full object-cover" />
                      <div className="px-3 py-2 text-[11px] text-zinc-600">
                        Current video URL preview
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-950">Publishing</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Choose if this product should stay as draft or go live now.
              </p>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("draft")}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                    status === "draft"
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-800"
                  }`}
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("published")}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                    status === "published"
                      ? "border-yellow-500 bg-yellow-500 text-black"
                      : "border-zinc-200 bg-white text-zinc-800"
                  }`}
                >
                  Publish Now
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={loading}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {loading ? "Saving..." : "Save Product"}
              </button>

              <button
                type="button"
                onClick={clearForm}
                className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
              >
                Clear Form
              </button>
            </section>

            <section className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-950">Preview</h2>

              <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white">
                <div className="relative h-56 bg-zinc-100">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={name || "Product preview"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      No image preview
                    </div>
                  )}
                </div>

                {previewVideo ? (
                  <div className="border-t border-zinc-200">
                    <video
                      src={previewVideo}
                      controls
                      className="h-44 w-full object-cover"
                    />
                  </div>
                ) : null}

                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500">
                    <Store className="h-3.5 w-3.5" />
                    Your Store
                  </div>

                  <h3 className="text-lg font-semibold text-zinc-950">
                    {name || "Product name"}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                    {description || "Product description preview will appear here."}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xl font-semibold text-zinc-950">
                      ${Number(price || 0).toFixed(2)}
                    </p>

                    <div className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-medium text-zinc-700">
                      {category || "General"}
                    </div>
                  </div>

                  {barcode ? (
                    <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                      Barcode: <span className="font-medium text-zinc-900">{barcode}</span>
                    </div>
                  ) : null}

                  {type === "physical" ? (
                    <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-xs text-zinc-600">
                      <div>
                        Weight:{" "}
                        <span className="font-medium text-zinc-900">
                          {weight || "0"} {weightUnit}
                        </span>
                      </div>
                      <div className="mt-1">
                        Package:{" "}
                        <span className="font-medium text-zinc-900">
                          {length || "0"} × {width || "0"} × {height || "0"} {distanceUnit}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}