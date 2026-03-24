"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import {
  checkModuleAccess,
  type AccessProfile,
} from "@/lib/access/guard"
import { sendSellerUnderReviewEmail } from "@/lib/email/sendSellerUnderReviewEmail"
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  FileText,
  Lock,
  Save,
  ShieldCheck,
  Store,
  User,
  Wallet,
  Upload,
  Home,
  FileBadge2,
  Building2,
} from "lucide-react"

type BusinessType = "individual" | "sole_proprietor" | "llc" | "company"
type ProductType = "digital" | "physical" | "both"

type FormDataType = {
  full_name: string
  email: string
  password: string
  phone: string
  country: string
  business_type: BusinessType

  store_name: string
  shop_handle: string
  business_category: string
  product_type: ProductType
  bio: string
  website: string
  social_link: string
  shipping_countries: string
  return_policy_accepted: boolean

  legal_first_name: string
  legal_last_name: string
  dob: string
  address_line_1: string
  city: string
  state: string
  zip_code: string
  nationality: string
  id_type: string
  id_number: string
  id_document_url: string
  proof_of_address_url: string

  legal_business_name: string
  ein_tin: string
  irs_document_url: string
  business_registration_url: string
  business_proof_of_address_url: string

  payout_country: string
  account_holder_name: string
  stripe_onboarding_complete: boolean
  payout_consent: boolean
  tos_accepted: boolean
}

const steps = [
  {
    id: 1,
    title: "Basic Account",
    description: "Create your seller account and choose your business type.",
    icon: User,
  },
  {
    id: 2,
    title: "Seller Profile",
    description: "Set up your store identity and what you plan to sell.",
    icon: Store,
  },
  {
    id: 3,
    title: "Identity & Business",
    description: "Provide legal, ID, and proof of address information.",
    icon: ShieldCheck,
  },
  {
    id: 4,
    title: "Payout & Legal",
    description: "Finish payout readiness and accept selling terms.",
    icon: Wallet,
  },
  {
    id: 5,
    title: "Review & Submit",
    description: "Confirm your application before sending it for review.",
    icon: FileText,
  },
]

const initialForm: FormDataType = {
  full_name: "",
  email: "",
  password: "",
  phone: "",
  country: "United States",
  business_type: "individual",

  store_name: "",
  shop_handle: "",
  business_category: "",
  product_type: "physical",
  bio: "",
  website: "",
  social_link: "",
  shipping_countries: "United States",
  return_policy_accepted: false,

  legal_first_name: "",
  legal_last_name: "",
  dob: "",
  address_line_1: "",
  city: "",
  state: "",
  zip_code: "",
  nationality: "",
  id_type: "driver_license",
  id_number: "",
  id_document_url: "",
  proof_of_address_url: "",

  legal_business_name: "",
  ein_tin: "",
  irs_document_url: "",
  business_registration_url: "",
  business_proof_of_address_url: "",

  payout_country: "United States",
  account_holder_name: "",
  stripe_onboarding_complete: false,
  payout_consent: false,
  tos_accepted: false,
}

export default function SellerApplyPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [accessLoading, setAccessLoading] = useState(true)
  const [accessAllowed, setAccessAllowed] = useState(false)
  const [accessMessage, setAccessMessage] = useState("")

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [uploadingDocs, setUploadingDocs] = useState(false)
  const [form, setForm] = useState<FormDataType>(initialForm)
  const [userId, setUserId] = useState<string | null>(null)

  const [idFile, setIdFile] = useState<File | null>(null)
  const [addressFile, setAddressFile] = useState<File | null>(null)
  const [irsFile, setIrsFile] = useState<File | null>(null)
  const [businessRegistrationFile, setBusinessRegistrationFile] = useState<File | null>(null)
  const [businessAddressFile, setBusinessAddressFile] = useState<File | null>(null)

  const progress = (step / steps.length) * 100
  const isBusinessEntity =
    form.business_type === "llc" || form.business_type === "company"

  useEffect(() => {
    let cancelled = false

    async function loadAccessAndDraft() {
      try {
        setAccessLoading(true)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          const rawDraft = localStorage.getItem("creatorgoat-seller-application-draft")
          if (rawDraft) {
            try {
              setForm(JSON.parse(rawDraft))
            } catch {
              console.error("Failed to parse local draft")
            }
          }

          if (!cancelled) {
            setAccessAllowed(false)
            setAccessMessage("Please log in and upgrade to a paid plan before creating a seller account.")
          }
          return
        }

        setUserId(user.id)

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("plan, trial_expires_at, subscription_expires_at")
          .eq("id", user.id)
          .single()

        if (profileError) {
          if (!cancelled) {
            setAccessAllowed(false)
            setAccessMessage("Unable to verify seller access right now.")
          }
          return
        }

        const access = checkModuleAccess((profile || {}) as AccessProfile, {
          blockedWhenFree: true,
        })

        if (!cancelled) {
          setAccessAllowed(access.allowed)
          setAccessMessage(
            access.allowed
              ? ""
              : access.reason || "You need a paid plan before you can create a seller account."
          )
        }

        if (!access.allowed) {
          return
        }

        const { data: application } = await supabase
          .from("seller_applications")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()

        if (application?.application_status === "submitted") {
          router.push("/marketplace/seller/pending")
          return
        }

        if (application?.application_status === "approved") {
          router.push("/dashboard")
          return
        }

        if (application?.application_status === "rejected") {
          if (!cancelled) {
            setAccessAllowed(false)
            setAccessMessage(
              "Your seller application was rejected. Seller access is currently closed."
            )
          }
          return
        }

        if (application) {
          setForm((prev) => ({
            ...prev,
            full_name: application.full_name ?? prev.full_name,
            email: application.email ?? prev.email,
            phone: application.phone ?? prev.phone,
            country: application.country ?? prev.country,
            business_type: application.business_type ?? prev.business_type,
            store_name: application.store_name ?? prev.store_name,
            shop_handle: application.shop_handle ?? prev.shop_handle,
            business_category: application.business_category ?? prev.business_category,
            product_type: application.product_type ?? prev.product_type,
            bio: application.bio ?? prev.bio,
            website: application.website ?? prev.website,
            social_link: application.social_link ?? prev.social_link,
            shipping_countries:
              application.shipping_countries ?? prev.shipping_countries,
            return_policy_accepted:
              application.return_policy_accepted ?? prev.return_policy_accepted,
            legal_first_name:
              application.legal_first_name ?? prev.legal_first_name,
            legal_last_name: application.legal_last_name ?? prev.legal_last_name,
            dob: application.dob ?? prev.dob,
            address_line_1: application.address_line_1 ?? prev.address_line_1,
            city: application.city ?? prev.city,
            state: application.state ?? prev.state,
            zip_code: application.zip_code ?? prev.zip_code,
            nationality: application.nationality ?? prev.nationality,
            id_type: application.id_type ?? prev.id_type,
            id_number: application.id_number ?? prev.id_number,
            id_document_url:
              application.id_document_url ?? prev.id_document_url,
            proof_of_address_url:
              application.proof_of_address_url ?? prev.proof_of_address_url,
            legal_business_name:
              application.legal_business_name ?? prev.legal_business_name,
            ein_tin: application.ein_tin ?? prev.ein_tin,
            irs_document_url:
              application.irs_document_url ?? prev.irs_document_url,
            business_registration_url:
              application.business_registration_url ??
              prev.business_registration_url,
            business_proof_of_address_url:
              application.business_proof_of_address_url ??
              prev.business_proof_of_address_url,
            payout_country: application.payout_country ?? prev.payout_country,
            account_holder_name:
              application.account_holder_name ?? prev.account_holder_name,
            payout_consent: application.payout_consent ?? prev.payout_consent,
            tos_accepted: application.tos_accepted ?? prev.tos_accepted,
          }))
        }
      } finally {
        if (!cancelled) {
          setAccessLoading(false)
        }
      }
    }

    loadAccessAndDraft()

    return () => {
      cancelled = true
    }
  }, [router, supabase])

  function updateField<K extends keyof FormDataType>(
    key: K,
    value: FormDataType[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function safeFileName(name: string) {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_")
  }

  async function uploadVerificationFile(
    file: File,
    currentUserId: string,
    folder:
      | "ids"
      | "addresses"
      | "irs"
      | "business-registration"
      | "business-address"
  ) {
    const fileName = `${Date.now()}-${safeFileName(file.name)}`
    const path = `${currentUserId}/${folder}/${fileName}`

    const { error } = await supabase.storage
      .from("verification")
      .upload(path, file, {
        upsert: true,
      })

    if (error) {
      throw error
    }

    const { data } = supabase.storage.from("verification").getPublicUrl(path)
    return data.publicUrl
  }

  async function uploadPendingDocuments(currentUserId: string) {
    let nextIdUrl = form.id_document_url || ""
    let nextAddressUrl = form.proof_of_address_url || ""
    let nextIrsUrl = form.irs_document_url || ""
    let nextBusinessRegistrationUrl = form.business_registration_url || ""
    let nextBusinessAddressUrl = form.business_proof_of_address_url || ""

    if (
      !idFile &&
      !addressFile &&
      !irsFile &&
      !businessRegistrationFile &&
      !businessAddressFile
    ) {
      return {
        id_document_url: nextIdUrl,
        proof_of_address_url: nextAddressUrl,
        irs_document_url: nextIrsUrl,
        business_registration_url: nextBusinessRegistrationUrl,
        business_proof_of_address_url: nextBusinessAddressUrl,
      }
    }

    setUploadingDocs(true)

    try {
      if (idFile) {
        nextIdUrl = await uploadVerificationFile(idFile, currentUserId, "ids")
      }

      if (addressFile) {
        nextAddressUrl = await uploadVerificationFile(
          addressFile,
          currentUserId,
          "addresses"
        )
      }

      if (irsFile) {
        nextIrsUrl = await uploadVerificationFile(irsFile, currentUserId, "irs")
      }

      if (businessRegistrationFile) {
        nextBusinessRegistrationUrl = await uploadVerificationFile(
          businessRegistrationFile,
          currentUserId,
          "business-registration"
        )
      }

      if (businessAddressFile) {
        nextBusinessAddressUrl = await uploadVerificationFile(
          businessAddressFile,
          currentUserId,
          "business-address"
        )
      }

      setForm((prev) => ({
        ...prev,
        id_document_url: nextIdUrl,
        proof_of_address_url: nextAddressUrl,
        irs_document_url: nextIrsUrl,
        business_registration_url: nextBusinessRegistrationUrl,
        business_proof_of_address_url: nextBusinessAddressUrl,
      }))

      return {
        id_document_url: nextIdUrl,
        proof_of_address_url: nextAddressUrl,
        irs_document_url: nextIrsUrl,
        business_registration_url: nextBusinessRegistrationUrl,
        business_proof_of_address_url: nextBusinessAddressUrl,
      }
    } finally {
      setUploadingDocs(false)
    }
  }

  async function saveDraft() {
    if (!accessAllowed) {
      alert("Paid plan required before saving a seller application draft.")
      router.push("/dashboard/billing")
      return
    }

    try {
      setSavingDraft(true)

      let currentUserId = userId
      let uploadedDocs = {
        id_document_url: form.id_document_url,
        proof_of_address_url: form.proof_of_address_url,
        irs_document_url: form.irs_document_url,
        business_registration_url: form.business_registration_url,
        business_proof_of_address_url: form.business_proof_of_address_url,
      }

      if (currentUserId) {
        uploadedDocs = await uploadPendingDocuments(currentUserId)
      }

      const nextDraft = {
        ...form,
        ...uploadedDocs,
      }

      localStorage.setItem(
        "creatorgoat-seller-application-draft",
        JSON.stringify(nextDraft)
      )

      if (currentUserId) {
        const payload = {
          user_id: currentUserId,
          full_name: nextDraft.full_name,
          email: nextDraft.email,
          phone: nextDraft.phone,
          country: nextDraft.country,
          business_type: nextDraft.business_type,
          store_name: nextDraft.store_name,
          shop_handle: nextDraft.shop_handle,
          business_category: nextDraft.business_category,
          product_type: nextDraft.product_type,
          bio: nextDraft.bio,
          website: nextDraft.website,
          social_link: nextDraft.social_link,
          shipping_countries: nextDraft.shipping_countries,
          return_policy_accepted: nextDraft.return_policy_accepted,
          legal_first_name: nextDraft.legal_first_name,
          legal_last_name: nextDraft.legal_last_name,
          dob: nextDraft.dob,
          address_line_1: nextDraft.address_line_1,
          city: nextDraft.city,
          state: nextDraft.state,
          zip_code: nextDraft.zip_code,
          nationality: nextDraft.nationality,
          id_type: nextDraft.id_type,
          id_number: nextDraft.id_number,
          id_document_url: nextDraft.id_document_url || null,
          proof_of_address_url: nextDraft.proof_of_address_url || null,
          legal_business_name: nextDraft.legal_business_name,
          ein_tin: nextDraft.ein_tin,
          irs_document_url: nextDraft.irs_document_url || null,
          business_registration_url:
            nextDraft.business_registration_url || null,
          business_proof_of_address_url:
            nextDraft.business_proof_of_address_url || null,
          payout_country: nextDraft.payout_country,
          account_holder_name: nextDraft.account_holder_name,
          payout_consent: nextDraft.payout_consent,
          tos_accepted: nextDraft.tos_accepted,
          application_status: "draft",
          updated_at: new Date().toISOString(),
        }

        await supabase.from("seller_applications").upsert(payload, {
          onConflict: "user_id",
        })
      }

      alert("Draft saved.")
    } catch (error) {
      console.error(error)
      alert("Could not save draft.")
    } finally {
      setSavingDraft(false)
    }
  }

  function validateStep(currentStep: number) {
    if (currentStep === 1) {
      return (
        form.full_name.trim() &&
        form.email.trim() &&
        form.password.trim() &&
        form.phone.trim() &&
        form.country.trim() &&
        form.business_type
      )
    }

    if (currentStep === 2) {
      return (
        form.store_name.trim() &&
        form.shop_handle.trim() &&
        form.business_category.trim() &&
        form.product_type &&
        form.bio.trim() &&
        form.shipping_countries.trim() &&
        form.return_policy_accepted
      )
    }

    if (currentStep === 3) {
      const baseValid =
        form.legal_first_name.trim() &&
        form.legal_last_name.trim() &&
        form.dob.trim() &&
        form.address_line_1.trim() &&
        form.city.trim() &&
        form.state.trim() &&
        form.zip_code.trim() &&
        form.nationality.trim() &&
        form.id_type.trim() &&
        (idFile || form.id_document_url) &&
        (addressFile || form.proof_of_address_url)

      if (isBusinessEntity) {
        return (
          baseValid &&
          form.legal_business_name.trim() &&
          form.ein_tin.trim() &&
          (irsFile || form.irs_document_url) &&
          (businessRegistrationFile || form.business_registration_url) &&
          (businessAddressFile || form.business_proof_of_address_url)
        )
      }

      return baseValid
    }

    if (currentStep === 4) {
      return (
        form.payout_country.trim() &&
        form.account_holder_name.trim() &&
        form.payout_consent &&
        form.tos_accepted
      )
    }

    return true
  }

  function nextStep() {
    if (!validateStep(step)) {
      alert("Please complete all required fields before continuing.")
      return
    }

    setStep((prev) => Math.min(prev + 1, steps.length))
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  async function handleSubmit() {
    if (!accessAllowed) {
      alert("Paid plan required before submitting a seller application.")
      router.push("/dashboard/billing")
      return
    }

    if (!validateStep(4)) {
      alert("Please complete payout and legal details before submitting.")
      return
    }

    try {
      setLoading(true)

      let currentUserId = userId

      if (!currentUserId) {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.full_name,
              role: "seller",
            },
          },
        })

        if (error) {
          alert(error.message)
          return
        }

        currentUserId = data.user?.id ?? null
        setUserId(currentUserId)
      }

      if (!currentUserId) {
        alert("Could not create seller account.")
        return
      }

      const uploadedDocs = await uploadPendingDocuments(currentUserId)

      await supabase.from("profiles").upsert(
        {
          id: currentUserId,
          email: form.email,
          full_name: form.full_name,
          phone: form.phone,
          role: "seller",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )

      await supabase.from("seller_applications").upsert(
        {
          user_id: currentUserId,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          country: form.country,
          business_type: form.business_type,
          store_name: form.store_name,
          shop_handle: form.shop_handle,
          business_category: form.business_category,
          product_type: form.product_type,
          bio: form.bio,
          website: form.website,
          social_link: form.social_link,
          shipping_countries: form.shipping_countries,
          return_policy_accepted: form.return_policy_accepted,
          legal_first_name: form.legal_first_name,
          legal_last_name: form.legal_last_name,
          dob: form.dob,
          address_line_1: form.address_line_1,
          city: form.city,
          state: form.state,
          zip_code: form.zip_code,
          nationality: form.nationality,
          id_type: form.id_type,
          id_number: form.id_number,
          id_document_url: uploadedDocs.id_document_url || null,
          proof_of_address_url: uploadedDocs.proof_of_address_url || null,
          legal_business_name: form.legal_business_name,
          ein_tin: form.ein_tin,
          irs_document_url: uploadedDocs.irs_document_url || null,
          business_registration_url:
            uploadedDocs.business_registration_url || null,
          business_proof_of_address_url:
            uploadedDocs.business_proof_of_address_url || null,
          payout_country: form.payout_country,
          account_holder_name: form.account_holder_name,
          payout_consent: form.payout_consent,
          tos_accepted: form.tos_accepted,
          application_status: "submitted",
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

      await supabase.from("seller_verification").upsert(
        {
          user_id: currentUserId,
          application_status: "submitted",
          identity_status: "identity_pending",
          stripe_status: "stripe_pending",
          email_verified: false,
          phone_verified: false,
          manual_review_required: true,
          risk_score: 0,
          stripe_onboarding_complete: form.stripe_onboarding_complete,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

      await supabase.from("seller_payouts").upsert(
        {
          user_id: currentUserId,
          onboarding_complete: form.stripe_onboarding_complete,
          payouts_enabled: false,
          charges_enabled: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

      await sendSellerUnderReviewEmail(form.email, form.full_name)

      localStorage.removeItem("creatorgoat-seller-application-draft")

      router.push("/marketplace/seller/pending")
    } catch (error) {
      console.error(error)
      alert("Something went wrong while submitting your seller application.")
    } finally {
      setLoading(false)
    }
  }

  function renderStep() {
    if (step === 1) {
      return (
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Full Name"
            value={form.full_name}
            onChange={(value) => updateField("full_name", value)}
            placeholder="Francois Derosema"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) => updateField("email", value)}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(value) => updateField("password", value)}
            placeholder="Create a password"
          />
          <Input
            label="Phone Number"
            value={form.phone}
            onChange={(value) => updateField("phone", value)}
            placeholder="+1 (555) 555-5555"
          />
          <Input
            label="Country"
            value={form.country}
            onChange={(value) => updateField("country", value)}
            placeholder="United States"
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-800">
              Business Type
            </label>
            <select
              value={form.business_type}
              onChange={(e) =>
                updateField("business_type", e.target.value as BusinessType)
              }
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
            >
              <option value="individual">Individual</option>
              <option value="sole_proprietor">Sole Proprietor</option>
              <option value="llc">LLC</option>
              <option value="company">Company</option>
            </select>
          </div>
        </div>
      )
    }

    if (step === 2) {
      return (
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Store Name"
            value={form.store_name}
            onChange={(value) => updateField("store_name", value)}
            placeholder="Spirit-Goat Beauty"
          />
          <Input
            label="Shop Handle"
            value={form.shop_handle}
            onChange={(value) => updateField("shop_handle", value)}
            placeholder="spiritgoatbeauty"
          />
          <Input
            label="Business Category"
            value={form.business_category}
            onChange={(value) => updateField("business_category", value)}
            placeholder="Beauty, fashion, digital products..."
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-800">
              Product Type
            </label>
            <select
              value={form.product_type}
              onChange={(e) =>
                updateField("product_type", e.target.value as ProductType)
              }
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
            >
              <option value="digital">Digital</option>
              <option value="physical">Physical</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <TextArea
              label="Short Bio"
              value={form.bio}
              onChange={(value) => updateField("bio", value)}
              placeholder="Tell us about your brand, your products, and what makes your store different."
            />
          </div>

          <Input
            label="Website"
            value={form.website}
            onChange={(value) => updateField("website", value)}
            placeholder="https://yourbrand.com"
          />
          <Input
            label="Social Link"
            value={form.social_link}
            onChange={(value) => updateField("social_link", value)}
            placeholder="https://instagram.com/yourbrand"
          />
          <Input
            label="Shipping Countries"
            value={form.shipping_countries}
            onChange={(value) => updateField("shipping_countries", value)}
            placeholder="United States, Canada"
          />

          <div className="md:col-span-2">
            <label className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <input
                type="checkbox"
                checked={form.return_policy_accepted}
                onChange={(e) =>
                  updateField("return_policy_accepted", e.target.checked)
                }
                className="mt-1 h-4 w-4 rounded border-zinc-300"
              />
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  I accept marketplace return and refund requirements
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Sellers must follow CreatorGoat return, refund, and order
                  handling rules before going live.
                </p>
              </div>
            </label>
          </div>
        </div>
      )
    }

    if (step === 3) {
      return (
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Legal First Name"
            value={form.legal_first_name}
            onChange={(value) => updateField("legal_first_name", value)}
            placeholder="Francois"
          />
          <Input
            label="Legal Last Name"
            value={form.legal_last_name}
            onChange={(value) => updateField("legal_last_name", value)}
            placeholder="Derosema"
          />
          <Input
            label="Date of Birth"
            type="date"
            value={form.dob}
            onChange={(value) => updateField("dob", value)}
          />
          <Input
            label="Nationality"
            value={form.nationality}
            onChange={(value) => updateField("nationality", value)}
            placeholder="Haitian / American"
          />
          <Input
            label="Address Line 1"
            value={form.address_line_1}
            onChange={(value) => updateField("address_line_1", value)}
            placeholder="123 Main Street"
          />
          <Input
            label="City"
            value={form.city}
            onChange={(value) => updateField("city", value)}
            placeholder="Cincinnati"
          />
          <Input
            label="State"
            value={form.state}
            onChange={(value) => updateField("state", value)}
            placeholder="Ohio"
          />
          <Input
            label="ZIP Code"
            value={form.zip_code}
            onChange={(value) => updateField("zip_code", value)}
            placeholder="45202"
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-800">
              ID Type
            </label>
            <select
              value={form.id_type}
              onChange={(e) => updateField("id_type", e.target.value)}
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
            >
              <option value="driver_license">Driver License</option>
              <option value="passport">Passport</option>
              <option value="state_id">State ID</option>
            </select>
          </div>

          <Input
            label="ID Number"
            value={form.id_number}
            onChange={(value) => updateField("id_number", value)}
            placeholder="Enter ID number"
          />

          {isBusinessEntity && (
            <>
              <Input
                label="Legal Business Name"
                value={form.legal_business_name}
                onChange={(value) => updateField("legal_business_name", value)}
                placeholder="Spirit-Goat Holdings LLC"
              />
              <Input
                label="EIN / TIN"
                value={form.ein_tin}
                onChange={(value) => updateField("ein_tin", value)}
                placeholder="12-3456789"
              />
            </>
          )}

          <div className="md:col-span-2 grid gap-5 md:grid-cols-2">
            <UploadField
              label="Upload ID (Driver License / Passport / State ID)"
              helperText="Upload a clear photo or PDF of your government-issued ID."
              accept="image/*,.pdf"
              file={idFile}
              existingUrl={form.id_document_url}
              onFileChange={setIdFile}
              onClear={() => {
                setIdFile(null)
                updateField("id_document_url", "")
              }}
              icon={<FileBadge2 className="h-4 w-4" />}
            />

            <UploadField
              label="Upload Proof of Address"
              helperText="Upload a utility bill, bank statement, or official mail showing your personal address."
              accept="image/*,.pdf"
              file={addressFile}
              existingUrl={form.proof_of_address_url}
              onFileChange={setAddressFile}
              onClear={() => {
                setAddressFile(null)
                updateField("proof_of_address_url", "")
              }}
              icon={<Home className="h-4 w-4" />}
            />
          </div>

          {isBusinessEntity && (
            <div className="md:col-span-2 grid gap-5 md:grid-cols-3">
              <UploadField
                label="Upload IRS EIN Letter"
                helperText="Upload CP 575, 147C, or your official IRS EIN confirmation."
                accept="image/*,.pdf"
                file={irsFile}
                existingUrl={form.irs_document_url}
                onFileChange={setIrsFile}
                onClear={() => {
                  setIrsFile(null)
                  updateField("irs_document_url", "")
                }}
                icon={<FileText className="h-4 w-4" />}
              />

              <UploadField
                label="Upload LLC / Company Registration"
                helperText="Upload your formation document, articles, or company registration certificate."
                accept="image/*,.pdf"
                file={businessRegistrationFile}
                existingUrl={form.business_registration_url}
                onFileChange={setBusinessRegistrationFile}
                onClear={() => {
                  setBusinessRegistrationFile(null)
                  updateField("business_registration_url", "")
                }}
                icon={<Building2 className="h-4 w-4" />}
              />

              <UploadField
                label="Upload Business Proof of Address"
                helperText="Upload business mail, utility bill, or official document showing the business address."
                accept="image/*,.pdf"
                file={businessAddressFile}
                existingUrl={form.business_proof_of_address_url}
                onFileChange={setBusinessAddressFile}
                onClear={() => {
                  setBusinessAddressFile(null)
                  updateField("business_proof_of_address_url", "")
                }}
                icon={<Home className="h-4 w-4" />}
              />
            </div>
          )}

          <div className="md:col-span-2 rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-700" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900">
                  Admin review + Stripe Identity ready
                </h4>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                  This flow now supports document collection for manual admin review.
                  You can also connect Stripe Identity later for automatic identity
                  verification without changing the seller application structure.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (step === 4) {
      return (
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Payout Country"
            value={form.payout_country}
            onChange={(value) => updateField("payout_country", value)}
            placeholder="United States"
          />
          <Input
            label="Account Holder Name"
            value={form.account_holder_name}
            onChange={(value) => updateField("account_holder_name", value)}
            placeholder="Francois Derosema"
          />

          <div className="md:col-span-2 space-y-4">
            <label className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <input
                type="checkbox"
                checked={form.stripe_onboarding_complete}
                onChange={(e) =>
                  updateField("stripe_onboarding_complete", e.target.checked)
                }
                className="mt-1 h-4 w-4 rounded border-zinc-300"
              />
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  Stripe onboarding completed
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Turn this on only when your real Stripe Connect onboarding flow
                  has been completed.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <input
                type="checkbox"
                checked={form.payout_consent}
                onChange={(e) => updateField("payout_consent", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-zinc-300"
              />
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  I consent to payout onboarding and tax collection
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Sellers must provide payout and tax details before receiving
                  marketplace funds.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <input
                type="checkbox"
                checked={form.tos_accepted}
                onChange={(e) => updateField("tos_accepted", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-zinc-300"
              />
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  I accept the CreatorGoat Seller Agreement and marketplace rules
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Selling prohibited items, fake products, or using false
                  identity information may result in permanent suspension.
                </p>
              </div>
            </label>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
          <h3 className="text-lg font-semibold text-zinc-900">
            Review your seller application
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Check your information before submitting. Your seller account will
            enter review and will not be able to publish products until fully
            verified and approved.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ReviewCard
            title="Basic Account"
            items={[
              ["Full Name", form.full_name],
              ["Email", form.email],
              ["Phone", form.phone],
              ["Country", form.country],
              ["Business Type", form.business_type],
            ]}
          />

          <ReviewCard
            title="Seller Profile"
            items={[
              ["Store Name", form.store_name],
              ["Shop Handle", form.shop_handle],
              ["Category", form.business_category],
              ["Product Type", form.product_type],
              ["Shipping Countries", form.shipping_countries],
            ]}
          />

          <ReviewCard
            title="Identity & Business"
            items={[
              [
                "Legal Name",
                `${form.legal_first_name} ${form.legal_last_name}`.trim(),
              ],
              ["DOB", form.dob],
              ["Nationality", form.nationality],
              ["Address", form.address_line_1],
              ["ID Type", form.id_type],
              ["Business Name", form.legal_business_name || "—"],
              [
                "ID Document",
                form.id_document_url ? "Uploaded" : idFile ? idFile.name : "Missing",
              ],
              [
                "Proof of Address",
                form.proof_of_address_url
                  ? "Uploaded"
                  : addressFile
                  ? addressFile.name
                  : "Missing",
              ],
              [
                "IRS EIN Letter",
                form.irs_document_url
                  ? "Uploaded"
                  : irsFile
                  ? irsFile.name
                  : isBusinessEntity
                  ? "Missing"
                  : "—",
              ],
              [
                "Business Registration",
                form.business_registration_url
                  ? "Uploaded"
                  : businessRegistrationFile
                  ? businessRegistrationFile.name
                  : isBusinessEntity
                  ? "Missing"
                  : "—",
              ],
              [
                "Business Address Proof",
                form.business_proof_of_address_url
                  ? "Uploaded"
                  : businessAddressFile
                  ? businessAddressFile.name
                  : isBusinessEntity
                  ? "Missing"
                  : "—",
              ],
            ]}
          />

          <ReviewCard
            title="Payout & Legal"
            items={[
              ["Payout Country", form.payout_country],
              ["Account Holder", form.account_holder_name],
              [
                "Stripe Onboarding",
                form.stripe_onboarding_complete ? "Complete" : "Pending",
              ],
              ["Payout Consent", form.payout_consent ? "Accepted" : "Pending"],
              ["Seller Agreement", form.tos_accepted ? "Accepted" : "Pending"],
            ]}
          />
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 text-zinc-700" />
            <div>
              <h4 className="text-sm font-semibold text-zinc-900">
                Publishing is hard-blocked until approval
              </h4>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                Seller must be fully approved before products can go live:
                application approved, identity verified, and payout onboarding
                completed.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentStepMeta = steps.find((item) => item.id === step)!
  const CurrentIcon = currentStepMeta.icon

  if (accessLoading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900">
        <div className="border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Seller Access
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-zinc-950">
              Checking access...
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Verifying whether this account can create a seller application.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!accessAllowed) {
    return (
      <div className="min-h-screen bg-white text-zinc-900">
        <div className="border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-5 py-12 md:px-8">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
              <Lock className="h-3.5 w-3.5" />
              Seller Access Locked
            </div>

            <h1 className="mt-4 text-3xl font-semibold text-zinc-950">
              Seller access is closed
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600">
              {accessMessage ||
                "You do not currently have access to seller onboarding."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/marketplace")}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
              >
                Back to Marketplace
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm font-semibold text-zinc-900">
                  Buyers can still use the marketplace
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Browsing products, product pages, cart, and checkout can stay open for customers.
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm font-semibold text-zinc-900">
                  Seller side remains controlled
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Seller onboarding, seller dashboard, add product, payouts, and publishing products remain blocked until approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>

          <button
            onClick={saveDraft}
            disabled={savingDraft || uploadingDocs}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {savingDraft ? "Saving..." : uploadingDocs ? "Uploading..." : "Save Draft"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-5">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                Seller Onboarding
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-zinc-950">
                Become a verified seller
              </h1>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Controlled entry marketplace onboarding for trusted brands,
                clean payouts, and serious seller verification.
              </p>
            </div>

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-800">Progress</span>
                <span className="text-zinc-500">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className="h-full rounded-full bg-zinc-900 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {steps.map((item) => {
                const Icon = item.icon
                const isActive = item.id === step
                const isComplete = item.id < step

                return (
                  <div
                    key={item.id}
                    className={`rounded-3xl border p-4 transition ${
                      isActive
                        ? "border-zinc-900 bg-white shadow-sm"
                        : "border-zinc-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                          isActive
                            ? "bg-zinc-900 text-white"
                            : isComplete
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-0.5 h-5 w-5 text-zinc-800" />
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Seller approval required
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-600">
                    New sellers cannot publish products or receive payouts until
                    review is completed.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <main className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  <CurrentIcon className="h-3.5 w-3.5" />
                  Step {step} of {steps.length}
                </div>
                <h2 className="text-2xl font-semibold text-zinc-950">
                  {currentStepMeta.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                  {currentStepMeta.description}
                </p>
              </div>
            </div>

            {renderStep()}

            <div className="mt-10 flex flex-col gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-200 px-5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex gap-3">
                <button
                  onClick={saveDraft}
                  disabled={savingDraft || uploadingDocs}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-200 px-5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {savingDraft ? "Saving..." : uploadingDocs ? "Uploading..." : "Save Draft"}
                </button>

                {step < steps.length ? (
                  <button
                    onClick={nextStep}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:scale-[1.01]"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading || uploadingDocs}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Submitting..."
                      : uploadingDocs
                      ? "Uploading..."
                      : "Submit Application"}
                    {!loading && !uploadingDocs && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function Input({
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
      <label className="mb-2 block text-sm font-medium text-zinc-800">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
      />
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-800">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
      />
    </div>
  )
}

function UploadField({
  label,
  helperText,
  accept,
  file,
  existingUrl,
  onFileChange,
  onClear,
  icon,
}: {
  label: string
  helperText: string
  accept: string
  file: File | null
  existingUrl: string
  onFileChange: (file: File | null) => void
  onClear: () => void
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
        {icon}
        {label}
      </div>

      <p className="mb-3 text-sm leading-6 text-zinc-600">{helperText}</p>

      <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50">
        <Upload className="h-4 w-4" />
        Choose File
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        />
      </label>

      <div className="mt-3 space-y-2">
        {file ? (
          <div className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800">
            Selected: <span className="font-medium">{file.name}</span>
          </div>
        ) : null}

        {existingUrl ? (
          <div className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800">
            Uploaded document saved.
            <a
              href={existingUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-2 font-medium text-zinc-900 underline"
            >
              View file
            </a>
          </div>
        ) : null}

        {(file || existingUrl) ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  )
}

function ReviewCard({
  title,
  items,
}: {
  title: string
  items: [string, string][]
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5">
      <h4 className="text-sm font-semibold text-zinc-900">{title}</h4>
      <div className="mt-4 space-y-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-3 text-sm last:border-b-0 last:pb-0"
          >
            <span className="text-zinc-500">{label}</span>
            <span className="max-w-[60%] text-right font-medium text-zinc-900">
              {value || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}