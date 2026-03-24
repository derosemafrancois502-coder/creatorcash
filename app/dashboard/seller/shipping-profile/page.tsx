"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Save, Truck } from "lucide-react"

type FormState = {
  full_name: string
  company: string
  email: string
  phone: string
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  postal_code: string
  country: string
}

const initialForm: FormState = {
  full_name: "",
  company: "",
  email: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "US",
}

export default function SellerShippingProfilePage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(initialForm)

  useEffect(() => {
    void loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setLoading(true)

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
        .select("role, full_name, email")
        .eq("id", user.id)
        .maybeSingle()

      if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
        router.push("/marketplace")
        return
      }

      const { data: shippingProfile, error } = await supabase
        .from("seller_shipping_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        console.error(error)
      }

      if (shippingProfile) {
        setForm({
          full_name: shippingProfile.full_name ?? "",
          company: shippingProfile.company ?? "",
          email: shippingProfile.email ?? "",
          phone: shippingProfile.phone ?? "",
          address_line_1: shippingProfile.address_line_1 ?? "",
          address_line_2: shippingProfile.address_line_2 ?? "",
          city: shippingProfile.city ?? "",
          state: shippingProfile.state ?? "",
          postal_code: shippingProfile.postal_code ?? "",
          country: shippingProfile.country ?? "US",
        })
      } else {
        setForm((prev) => ({
          ...prev,
          full_name: profile.full_name ?? "",
          email: profile.email ?? "",
        }))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!userId) return

    if (
      !form.full_name.trim() ||
      !form.address_line_1.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.postal_code.trim() ||
      !form.country.trim()
    ) {
      alert("Please complete all required shipping fields.")
      return
    }

    try {
      setSaving(true)

      const { error } = await supabase
        .from("seller_shipping_profiles")
        .upsert(
          {
            user_id: userId,
            full_name: form.full_name.trim(),
            company: form.company.trim() || null,
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            address_line_1: form.address_line_1.trim(),
            address_line_2: form.address_line_2.trim() || null,
            city: form.city.trim(),
            state: form.state.trim(),
            postal_code: form.postal_code.trim(),
            country: form.country.trim(),
          },
          { onConflict: "user_id" }
        )

      if (error) {
        alert(error.message)
        return
      }

      alert("Shipping profile saved.")
    } catch (error) {
      console.error(error)
      alert("Could not save shipping profile.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-zinc-200" />
          <h2 className="text-lg font-semibold text-zinc-900">Loading shipping profile...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/dashboard/seller/shipping"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shipping
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-600/80">
            CreatorGoat Shipping
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950 md:text-5xl">
            Seller Shipping Profile
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
            Set your shipping origin address once so labels can be created automatically.
          </p>
        </div>

        <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100">
              <Truck className="h-5 w-5 text-zinc-800" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">Origin Address</h2>
              <p className="text-sm text-zinc-500">
                This address will be used as the sender address for Shippo labels.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full Name" value={form.full_name} onChange={(v) => updateField("full_name", v)} />
            <Field label="Company" value={form.company} onChange={(v) => updateField("company", v)} />
            <Field label="Email" value={form.email} onChange={(v) => updateField("email", v)} />
            <Field label="Phone" value={form.phone} onChange={(v) => updateField("phone", v)} />
            <Field label="Address Line 1" value={form.address_line_1} onChange={(v) => updateField("address_line_1", v)} />
            <Field label="Address Line 2" value={form.address_line_2} onChange={(v) => updateField("address_line_2", v)} />
            <Field label="City" value={form.city} onChange={(v) => updateField("city", v)} />
            <Field label="State" value={form.state} onChange={(v) => updateField("state", v)} />
            <Field label="Postal Code" value={form.postal_code} onChange={(v) => updateField("postal_code", v)} />
            <Field label="Country" value={form.country} onChange={(v) => updateField("country", v)} />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-6 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Shipping Profile"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-800">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-yellow-500/40"
      />
    </div>
  )
}