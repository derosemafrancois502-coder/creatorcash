"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Package,
  Palette,
  Plus,
  Ruler,
  Save,
  Store,
  Truck,
  X,
  Barcode,
  Tag,
  Upload,
  Image as ImageIcon,
  Video,
  Boxes,
  Minus,
  Trash2,
} from "lucide-react"

type Product = {
  id: string
  user_id: string
  shop_id: string | null
  name: string
  description: string | null
  price: number
  compare_at_price: number | null
  sku: string | null
  barcode: string | null
  type: "digital" | "physical"
  category: string | null
  image_url: string | null
  video_url: string | null
  status: "draft" | "published" | "archived"
  inventory_count: number | null
  published_at: string | null
  weight: number | null
  weight_unit: "lb" | "oz" | "g" | "kg" | null
  length: number | null
  width: number | null
  height: number | null
  distance_unit: "in" | "cm" | null
  colors: string[] | null
  sizes: string[] | null
}

type Shop = {
  id: string
  store_name: string
  slug: string
  approved: boolean
  status: string
}

type Verification = {
  application_status: string
  identity_status: string
  stripe_onboarding_complete: boolean
}

const emptyForm = {
  id: "",
  name: "",
  description: "",
  price: "",
  compare_at_price: "",
  sku: "",
  barcode: "",
  type: "physical" as "digital" | "physical",
  category: "",
  image_url: "",
  video_url: "",
  inventory_count: "0",
  weight: "",
  weight_unit: "lb" as "lb" | "oz" | "g" | "kg",
  length: "",
  width: "",
  height: "",
  distance_unit: "in" as "in" | "cm",
  colors: [] as string[],
  sizes: [] as string[],
}

export default function SellerProductsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [shop, setShop] = useState<Shop | null>(null)
  const [verification, setVerification] = useState<Verification | null>(null)
  const [products, setProducts] = useState<Product[]>([])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const [newColor, setNewColor] = useState("")
  const [newSize, setNewSize] = useState("")

  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>("")

  const [inventoryDrafts, setInventoryDrafts] = useState<Record<string, string>>({})
  const [inventorySavingId, setInventorySavingId] = useState<string | null>(null)

  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    async function loadPage() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/marketplace")
          return
        }

        setUserId(user.id)

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()

        if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
          router.push("/marketplace")
          return
        }

        const { data: verificationData } = await supabase
          .from("seller_verification")
          .select("application_status, identity_status, stripe_onboarding_complete")
          .eq("user_id", user.id)
          .maybeSingle()

        if (verificationData) {
          setVerification(verificationData)
        }

        const { data: shopData } = await supabase
          .from("shops")
          .select("id, store_name, slug, approved, status")
          .eq("user_id", user.id)
          .maybeSingle()

        if (shopData) {
          setShop(shopData)
        }

        const { data: productData } = await supabase
          .from("products")
          .select(
            "id, user_id, shop_id, name, description, price, compare_at_price, sku, barcode, type, category, image_url, video_url, status, inventory_count, published_at, weight, weight_unit, length, width, height, distance_unit, colors, sizes"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        const nextProducts = (productData ?? []) as Product[]
        setProducts(nextProducts)

        const nextInventoryDrafts: Record<string, string> = {}
        for (const product of nextProducts) {
          nextInventoryDrafts[product.id] = String(product.inventory_count ?? 0)
        }
        setInventoryDrafts(nextInventoryDrafts)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    void loadPage()
  }, [router, supabase])

  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url))
      if (videoPreview) URL.revokeObjectURL(videoPreview)
    }
  }, [photoPreviews, videoPreview])

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function clearMediaState() {
    photoPreviews.forEach((url) => URL.revokeObjectURL(url))
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }

    setPhotoFiles([])
    setPhotoPreviews([])
    setVideoFile(null)
    setVideoPreview("")

    if (photoInputRef.current) {
      photoInputRef.current.value = ""
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = ""
    }
  }

  function resetForm() {
    setSelectedId(null)
    setForm(emptyForm)
    setNewColor("")
    setNewSize("")
    clearMediaState()
  }

  function startNewProduct() {
    resetForm()
  }

  function editProduct(product: Product) {
    clearMediaState()
    setSelectedId(product.id)
    setForm({
      id: product.id,
      name: product.name ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      compare_at_price:
        product.compare_at_price !== null && product.compare_at_price !== undefined
          ? String(product.compare_at_price)
          : "",
      sku: product.sku ?? "",
      barcode: product.barcode ?? "",
      type: product.type ?? "physical",
      category: product.category ?? "",
      image_url: product.image_url ?? "",
      video_url: product.video_url ?? "",
      inventory_count: String(product.inventory_count ?? 0),
      weight:
        product.weight !== null && product.weight !== undefined
          ? String(product.weight)
          : "",
      weight_unit: (product.weight_unit as "lb" | "oz" | "g" | "kg") ?? "lb",
      length:
        product.length !== null && product.length !== undefined
          ? String(product.length)
          : "",
      width:
        product.width !== null && product.width !== undefined
          ? String(product.width)
          : "",
      height:
        product.height !== null && product.height !== undefined
          ? String(product.height)
          : "",
      distance_unit: (product.distance_unit as "in" | "cm") ?? "in",
      colors: product.colors ?? [],
      sizes: product.sizes ?? [],
    })
    setNewColor("")
    setNewSize("")
  }

  function sellerCanPublish() {
    return (
      verification?.application_status === "approved" &&
      verification?.identity_status === "verified" &&
      verification?.stripe_onboarding_complete === true
    )
  }

  function addColor() {
    const value = newColor.trim()
    if (!value) return
    if (form.colors.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setNewColor("")
      return
    }
    setForm((prev) => ({
      ...prev,
      colors: [...prev.colors, value],
    }))
    setNewColor("")
  }

  function removeColor(value: string) {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((item) => item !== value),
    }))
  }

  function addSize() {
    const value = newSize.trim()
    if (!value) return
    if (form.sizes.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setNewSize("")
      return
    }
    setForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, value],
    }))
    setNewSize("")
  }

  function removeSize(value: string) {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((item) => item !== value),
    }))
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, 5)

    photoPreviews.forEach((url) => URL.revokeObjectURL(url))

    setPhotoFiles(files)
    setPhotoPreviews(files.map((file) => URL.createObjectURL(file)))
  }

  function handleVideoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }

    setVideoFile(file)
    setVideoPreview(file ? URL.createObjectURL(file) : "")
  }

  function removePhoto(index: number) {
    const nextFiles = [...photoFiles]
    const nextPreviews = [...photoPreviews]

    const removedPreview = nextPreviews[index]
    if (removedPreview) {
      URL.revokeObjectURL(removedPreview)
    }

    nextFiles.splice(index, 1)
    nextPreviews.splice(index, 1)

    setPhotoFiles(nextFiles)
    setPhotoPreviews(nextPreviews)
  }

  function removeVideo() {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }

    setVideoFile(null)
    setVideoPreview("")
    if (videoInputRef.current) {
      videoInputRef.current.value = ""
    }
  }

  function validateForm() {
    if (!form.name.trim()) {
      alert("Product name is required.")
      return false
    }

    if (!form.price.trim() || Number(form.price) < 0) {
      alert("Enter a valid price.")
      return false
    }

    if (
      form.compare_at_price.trim() &&
      Number(form.compare_at_price) < Number(form.price)
    ) {
      alert("Compare at price must be greater than or equal to the main price.")
      return false
    }

    if (!shop?.id) {
      alert("No seller shop found yet.")
      return false
    }

    if (photoFiles.length > 5) {
      alert("Maximum 5 photos allowed.")
      return false
    }

    if (form.type === "physical") {
      if (!form.weight.trim() || Number(form.weight) <= 0) {
        alert("Physical products need a valid weight.")
        return false
      }

      if (!form.length.trim() || Number(form.length) <= 0) {
        alert("Physical products need a valid length.")
        return false
      }

      if (!form.width.trim() || Number(form.width) <= 0) {
        alert("Physical products need a valid width.")
        return false
      }

      if (!form.height.trim() || Number(form.height) <= 0) {
        alert("Physical products need a valid height.")
        return false
      }
    }

    return true
  }

  async function refreshProducts(currentUserId: string) {
    const { data } = await supabase
      .from("products")
      .select(
        "id, user_id, shop_id, name, description, price, compare_at_price, sku, barcode, type, category, image_url, video_url, status, inventory_count, published_at, weight, weight_unit, length, width, height, distance_unit, colors, sizes"
      )
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false })

    const nextProducts = (data ?? []) as Product[]
    setProducts(nextProducts)

    setInventoryDrafts((prev) => {
      const next = { ...prev }
      for (const product of nextProducts) {
        next[product.id] = String(product.inventory_count ?? 0)
      }
      return next
    })
  }

  async function uploadFileToStorage(file: File, folder: string) {
    if (!userId) return null

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

  async function resolveMediaUrls() {
    let mainImageUrl = form.image_url.trim() || null
    let mainVideoUrl = form.video_url.trim() || null

    if (photoFiles.length > 0) {
      const uploadedImageUrl = await uploadFileToStorage(photoFiles[0], "images")
      mainImageUrl = uploadedImageUrl
    }

    if (videoFile) {
      const uploadedVideoUrl = await uploadFileToStorage(videoFile, "videos")
      mainVideoUrl = uploadedVideoUrl
    }

    return {
      image_url: mainImageUrl,
      video_url: mainVideoUrl,
    }
  }

  async function getPayload() {
    const media = await resolveMediaUrls()

    return {
      user_id: userId,
      shop_id: shop?.id ?? null,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      compare_at_price: form.compare_at_price.trim()
        ? Number(form.compare_at_price)
        : null,
      sku: form.sku.trim() || null,
      barcode: form.barcode.trim() || null,
      type: form.type,
      category: form.category.trim() || null,
      image_url: media.image_url,
      video_url: media.video_url,
      inventory_count: Number(form.inventory_count || 0),
      weight: form.type === "physical" ? Number(form.weight) : null,
      weight_unit: form.type === "physical" ? form.weight_unit : null,
      length: form.type === "physical" ? Number(form.length) : null,
      width: form.type === "physical" ? Number(form.width) : null,
      height: form.type === "physical" ? Number(form.height) : null,
      distance_unit: form.type === "physical" ? form.distance_unit : null,
      colors: form.type === "physical" ? form.colors : [],
      sizes: form.type === "physical" ? form.sizes : [],
    }
  }

  async function handleSaveDraft() {
    if (!userId) return
    if (!validateForm()) return

    try {
      setSaving(true)
      setUploadingMedia(true)

      const payload = {
        ...(await getPayload()),
        status: "draft",
      }

      if (selectedId) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", selectedId)
          .eq("user_id", userId)

        if (error) {
          alert(error.message)
          return
        }
      } else {
        const { error } = await supabase.from("products").insert(payload)

        if (error) {
          alert(error.message)
          return
        }
      }

      await refreshProducts(userId)
      alert("Draft saved.")
      resetForm()
    } catch (error) {
      console.error(error)
      alert("Could not save product draft. Make sure the 'product-media' storage bucket exists.")
    } finally {
      setSaving(false)
      setUploadingMedia(false)
    }
  }

  async function handlePublish() {
    if (!userId) return
    if (!validateForm()) return

    const canPublish = sellerCanPublish()

    if (!canPublish) {
      alert("Your seller account must be fully verified before products can go live.")
      return
    }

    try {
      setPublishing(true)
      setUploadingMedia(true)

      const payload = {
        ...(await getPayload()),
        status: "published",
        published_at: new Date().toISOString(),
      }

      if (selectedId) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", selectedId)
          .eq("user_id", userId)

        if (error) {
          alert(error.message)
          return
        }
      } else {
        const { error } = await supabase.from("products").insert(payload)

        if (error) {
          alert(error.message)
          return
        }
      }

      await refreshProducts(userId)
      alert("Product published.")
      resetForm()
    } catch (error) {
      console.error(error)
      alert("Could not publish product. Make sure the 'product-media' storage bucket exists.")
    } finally {
      setPublishing(false)
      setUploadingMedia(false)
    }
  }

  async function moveToDraft(productId: string) {
    if (!userId) return

    const { error } = await supabase
      .from("products")
      .update({ status: "draft" })
      .eq("id", productId)
      .eq("user_id", userId)

    if (error) {
      alert(error.message)
      return
    }

    await refreshProducts(userId)
  }

  async function handleDeleteProduct(productId: string) {
    if (!userId) return

    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    )

    if (!confirmed) return

    try {
      setDeletingId(productId)

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)
        .eq("user_id", userId)

      if (error) {
        alert(error.message)
        return
      }

      await refreshProducts(userId)

      if (selectedId === productId) {
        resetForm()
      }

      alert("Product deleted.")
    } catch (error) {
      console.error(error)
      alert("Could not delete product.")
    } finally {
      setDeletingId(null)
    }
  }

  function getInventoryCount(product: Product) {
    return Number(product.inventory_count ?? 0)
  }

  function getInventoryStatus(product: Product) {
    const count = getInventoryCount(product)
    if (count <= 0) return "out"
    if (count <= 5) return "low"
    return "in"
  }

  function setInventoryDraftValue(productId: string, value: string) {
    if (!/^\d*$/.test(value)) return
    setInventoryDrafts((prev) => ({
      ...prev,
      [productId]: value,
    }))
  }

  function adjustInventoryDraft(productId: string, delta: number) {
    setInventoryDrafts((prev) => {
      const current = Number(prev[productId] ?? 0)
      const nextValue = Math.max(0, current + delta)
      return {
        ...prev,
        [productId]: String(nextValue),
      }
    })
  }

  async function saveInventory(productId: string) {
    if (!userId) return

    const value = Number(inventoryDrafts[productId] ?? 0)
    if (Number.isNaN(value) || value < 0) {
      alert("Inventory must be 0 or higher.")
      return
    }

    try {
      setInventorySavingId(productId)

      const { error } = await supabase
        .from("products")
        .update({ inventory_count: value })
        .eq("id", productId)
        .eq("user_id", userId)

      if (error) {
        alert(error.message)
        return
      }

      await refreshProducts(userId)

      if (selectedId === productId) {
        setForm((prev) => ({
          ...prev,
          inventory_count: String(value),
        }))
      }
    } catch (error) {
      console.error(error)
      alert("Could not update inventory.")
    } finally {
      setInventorySavingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-white">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-white/10" />
          <h2 className="text-lg font-semibold">Loading seller products...</h2>
          <p className="mt-2 text-sm text-white/60">Preparing your product workspace.</p>
        </div>
      </div>
    )
  }

  const canPublish = sellerCanPublish()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/seller"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Seller Dashboard
            </Link>
          </div>

          <button
            onClick={startNewProduct}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            New Product
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <TopCard
            title="Shop"
            value={shop?.store_name || "No shop yet"}
            icon={<Store className="h-5 w-5" />}
          />
          <TopCard
            title="Seller Status"
            value={verification?.application_status || "Pending"}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <TopCard
            title="Publishing Access"
            value={canPublish ? "Approved" : "Blocked"}
            icon={
              canPublish ? (
                <Eye className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )
            }
          />
          <TopCard
            title="Products"
            value={String(products.length)}
            icon={<Boxes className="h-5 w-5" />}
          />
        </div>

        {!canPublish && (
          <div className="mb-8 rounded-[2rem] border border-amber-500/20 bg-amber-500/10 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-300" />
              <div>
                <h3 className="text-sm font-semibold text-amber-200">
                  Seller publishing is blocked
                </h3>
                <p className="mt-2 text-sm leading-6 text-amber-100/80">
                  Your seller account must be fully verified before products can go live.
                </p>
                <div className="mt-3 space-y-1 text-sm text-amber-100/70">
                  <p>Application: {verification?.application_status || "pending"}</p>
                  <p>Identity: {verification?.identity_status || "pending"}</p>
                  <p>
                    Stripe onboarding:{" "}
                    {verification?.stripe_onboarding_complete ? "complete" : "pending"}
                  </p>
                </div>
                <Link
                  href="/marketplace/seller/pending"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-300/20 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-200/10"
                >
                  View Seller Status
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_460px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                  Product List
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Your Products</h2>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 p-8 text-center">
                <Package className="mx-auto h-10 w-10 text-white/35" />
                <h3 className="mt-4 text-lg font-semibold">No products yet</h3>
                <p className="mt-2 text-sm text-white/55">
                  Create your first product draft, then publish when seller approval is complete.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => {
                  const inventoryCount = getInventoryCount(product)
                  const inventoryStatus = getInventoryStatus(product)
                  const inventoryDraftValue =
                    inventoryDrafts[product.id] ?? String(inventoryCount)

                  return (
                    <div
                      key={product.id}
                      className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.15em] text-white/60">
                                {product.status}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.15em] text-white/60">
                                {product.type}
                              </span>

                              {inventoryStatus === "out" ? (
                                <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-red-300">
                                  Out of stock
                                </span>
                              ) : inventoryStatus === "low" ? (
                                <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-yellow-300">
                                  {inventoryCount} in stock
                                </span>
                              ) : (
                                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-300">
                                  {inventoryCount} in stock
                                </span>
                              )}
                            </div>

                            <p className="mt-2 line-clamp-2 text-sm text-white/60">
                              {product.description || "No description yet."}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/70">
                              <span>Price: ${Number(product.price || 0).toFixed(2)}</span>
                              {product.compare_at_price !== null &&
                              product.compare_at_price !== undefined ? (
                                <span>
                                  Compare: ${Number(product.compare_at_price || 0).toFixed(2)}
                                </span>
                              ) : null}
                              <span>Category: {product.category || "—"}</span>
                              <span>Inventory: {inventoryCount}</span>
                            </div>

                            {(product.sku || product.barcode) && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {product.sku ? (
                                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75">
                                    <Tag className="h-3.5 w-3.5" />
                                    SKU: {product.sku}
                                  </div>
                                ) : null}

                                {product.barcode ? (
                                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75">
                                    <Barcode className="h-3.5 w-3.5" />
                                    Barcode: {product.barcode}
                                  </div>
                                ) : null}
                              </div>
                            )}

                            {(product.colors && product.colors.length > 0) ||
                            (product.sizes && product.sizes.length > 0) ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {product.colors && product.colors.length > 0 ? (
                                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75">
                                    <Palette className="h-3.5 w-3.5" />
                                    {product.colors.join(", ")}
                                  </div>
                                ) : null}

                                {product.sizes && product.sizes.length > 0 ? (
                                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75">
                                    <Ruler className="h-3.5 w-3.5" />
                                    {product.sizes.join(", ")}
                                  </div>
                                ) : null}
                              </div>
                            ) : null}

                            {product.type === "physical" ? (
                              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75">
                                <Truck className="h-3.5 w-3.5" />
                                {product.weight ?? 0} {product.weight_unit || "lb"} •{" "}
                                {product.length ?? 0} × {product.width ?? 0} × {product.height ?? 0}{" "}
                                {product.distance_unit || "in"}
                              </div>
                            ) : (
                              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75">
                                Digital product
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => editProduct(product)}
                              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={deletingId === product.id}
                              className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15 disabled:opacity-60"
                            >
                              <Trash2 className="h-4 w-4" />
                              {deletingId === product.id ? "Deleting..." : "Delete"}
                            </button>

                            {product.status === "published" ? (
                              <button
                                onClick={() => moveToDraft(product.id)}
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                              >
                                Move to Draft
                              </button>
                            ) : null}
                          </div>
                        </div>

                        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <Boxes className="h-4 w-4 text-yellow-400" />
                            <h4 className="text-sm font-semibold text-white">
                              Manage Inventory
                            </h4>
                          </div>

                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => adjustInventoryDraft(product.id, -5)}
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-medium text-white transition hover:bg-white/10"
                              >
                                <Minus className="mr-1 h-3.5 w-3.5" />
                                5
                              </button>

                              <button
                                type="button"
                                onClick={() => adjustInventoryDraft(product.id, -1)}
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-medium text-white transition hover:bg-white/10"
                              >
                                <Minus className="mr-1 h-3.5 w-3.5" />
                                1
                              </button>

                              <button
                                type="button"
                                onClick={() => adjustInventoryDraft(product.id, 1)}
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-medium text-white transition hover:bg-white/10"
                              >
                                <Plus className="mr-1 h-3.5 w-3.5" />
                                1
                              </button>

                              <button
                                type="button"
                                onClick={() => adjustInventoryDraft(product.id, 5)}
                                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-medium text-white transition hover:bg-white/10"
                              >
                                <Plus className="mr-1 h-3.5 w-3.5" />
                                5
                              </button>
                            </div>

                            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                              <input
                                type="text"
                                value={inventoryDraftValue}
                                onChange={(e) =>
                                  setInventoryDraftValue(product.id, e.target.value)
                                }
                                className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-white/25 md:w-28"
                                placeholder="0"
                              />

                              <button
                                type="button"
                                onClick={() => saveInventory(product.id)}
                                disabled={inventorySavingId === product.id}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-60"
                              >
                                <Save className="h-4 w-4" />
                                {inventorySavingId === product.id ? "Saving..." : "Save Stock"}
                              </button>
                            </div>
                          </div>

                          <p className="mt-3 text-xs text-white/50">
                            Customer-facing stock should show{" "}
                            <span className="font-semibold text-red-300">Out of stock</span>{" "}
                            when inventory reaches 0, and a live count like{" "}
                            <span className="font-semibold text-emerald-300">4 in stock</span>{" "}
                            when stock is available.
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                Product Editor
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {selectedId ? "Edit Product" : "New Product"}
              </h2>
            </div>

            <div className="space-y-4">
              <Field
                label="Product Name"
                value={form.name}
                onChange={(v) => updateField("name", v)}
                placeholder="Luxury Chebe Shampoo Set"
              />

              <Field
                label="Price"
                type="number"
                value={form.price}
                onChange={(v) => updateField("price", v)}
                placeholder="24.99"
              />

              <Field
                label="Compare At Price"
                type="number"
                value={form.compare_at_price}
                onChange={(v) => updateField("compare_at_price", v)}
                placeholder="29.99"
              />

              <Field
                label="SKU"
                value={form.sku}
                onChange={(v) => updateField("sku", v)}
                placeholder="CG-SHIRT-BLK-L"
              />

              <Field
                label="Barcode / UPC / EAN"
                value={form.barcode}
                onChange={(v) => updateField("barcode", v)}
                placeholder="123456789012"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Product Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-white/25"
                >
                  <option value="physical">Physical</option>
                  <option value="digital">Digital</option>
                </select>
              </div>

              <Field
                label="Category"
                value={form.category}
                onChange={(v) => updateField("category", v)}
                placeholder="Beauty"
              />

              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-yellow-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Product Photos
                  </h3>
                </div>

                <p className="mb-4 text-xs text-white/50">
                  Upload up to 5 photos. Current schema saves the first photo as the main product image.
                </p>

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
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <Upload className="h-4 w-4" />
                  Upload Photos
                </button>

                {photoPreviews.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {photoPreviews.map((preview, index) => (
                      <div
                        key={preview}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30"
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
                        <div className="px-3 py-2 text-[11px] text-white/70">
                          {index === 0 ? "Main image" : `Photo ${index + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : form.image_url ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <img
                      src={form.image_url}
                      alt="Current product"
                      className="h-40 w-full object-cover"
                    />
                    <div className="px-3 py-2 text-[11px] text-white/70">
                      Current saved main image
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-white/45">No photos uploaded yet.</p>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Video className="h-4 w-4 text-yellow-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Product Video
                  </h3>
                </div>

                <p className="mb-4 text-xs text-white/50">
                  Upload 1 product video. It saves as the main video for this product.
                </p>

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
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  <Upload className="h-4 w-4" />
                  Upload Video
                </button>

                {videoPreview ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <video
                      src={videoPreview}
                      controls
                      className="h-52 w-full object-cover"
                    />
                    <div className="flex items-center justify-between px-3 py-2 text-[11px] text-white/70">
                      <span>New video ready</span>
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="inline-flex items-center gap-1 text-red-300"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : form.video_url ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <video
                      src={form.video_url}
                      controls
                      className="h-52 w-full object-cover"
                    />
                    <div className="px-3 py-2 text-[11px] text-white/70">
                      Current saved video
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-white/45">No video uploaded yet.</p>
                )}
              </div>

              <Field
                label="Inventory Count"
                type="number"
                value={form.inventory_count}
                onChange={(v) => updateField("inventory_count", v)}
                placeholder="0"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={5}
                  placeholder="Write your product description..."
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
                />
              </div>

              {form.type === "physical" ? (
                <>
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <Palette className="h-4 w-4 text-yellow-400" />
                      <h3 className="text-sm font-semibold text-white">Color Variants</h3>
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        placeholder="Black"
                        className="h-12 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-white/25"
                      />
                      <button
                        type="button"
                        onClick={addColor}
                        className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-black transition hover:scale-[1.01]"
                      >
                        Add
                      </button>
                    </div>

                    {form.colors.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {form.colors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => removeColor(color)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80"
                          >
                            {color}
                            <X className="h-3.5 w-3.5" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-xs text-white/45">No colors added yet.</p>
                    )}
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-yellow-400" />
                      <h3 className="text-sm font-semibold text-white">Size Variants</h3>
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        placeholder="M"
                        className="h-12 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-white/25"
                      />
                      <button
                        type="button"
                        onClick={addSize}
                        className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-black transition hover:scale-[1.01]"
                      >
                        Add
                      </button>
                    </div>

                    {form.sizes.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {form.sizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => removeSize(size)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80"
                          >
                            {size}
                            <X className="h-3.5 w-3.5" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-xs text-white/45">No sizes added yet.</p>
                    )}
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-yellow-400" />
                      <h3 className="text-sm font-semibold text-white">Shipping Details</h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field
                        label="Weight"
                        type="number"
                        value={form.weight}
                        onChange={(v) => updateField("weight", v)}
                        placeholder="2"
                      />

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/80">
                          Weight Unit
                        </label>
                        <select
                          value={form.weight_unit}
                          onChange={(e) => updateField("weight_unit", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-white/25"
                        >
                          <option value="lb">lb</option>
                          <option value="oz">oz</option>
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                        </select>
                      </div>

                      <Field
                        label="Length"
                        type="number"
                        value={form.length}
                        onChange={(v) => updateField("length", v)}
                        placeholder="10"
                      />

                      <Field
                        label="Width"
                        type="number"
                        value={form.width}
                        onChange={(v) => updateField("width", v)}
                        placeholder="8"
                      />

                      <Field
                        label="Height"
                        type="number"
                        value={form.height}
                        onChange={(v) => updateField("height", v)}
                        placeholder="4"
                      />

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/80">
                          Distance Unit
                        </label>
                        <select
                          value={form.distance_unit}
                          onChange={(e) => updateField("distance_unit", e.target.value)}
                          className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-white/25"
                        >
                          <option value="in">in</option>
                          <option value="cm">cm</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

              <div className="flex flex-col gap-3 pt-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving || uploadingMedia}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving || uploadingMedia ? "Saving..." : "Save Draft"}
                </button>

                <button
                  onClick={handlePublish}
                  disabled={publishing || uploadingMedia}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {publishing || uploadingMedia ? "Publishing..." : "Publish Product"}
                </button>

                <button
                  onClick={resetForm}
                  type="button"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-transparent text-sm font-medium text-white/75 transition hover:bg-white/5"
                >
                  Clear Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/80">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-white/25"
      />
    </div>
  )
}

function TopCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
        {icon}
      </div>
      <p className="text-xs uppercase tracking-[0.18em] text-white/45">{title}</p>
      <p className="mt-2 text-lg font-semibold capitalize text-white">{value}</p>
    </div>
  )
}