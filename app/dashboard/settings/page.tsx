"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type ThemeType = "dark" | "luxury"

type ProfileRow = {
  id: string
  full_name: string | null
  username: string | null
  brand_name: string | null
  bio: string | null
  email: string | null
  phone: string | null
  address: string | null
  avatar_url: string | null
  theme: ThemeType | null
  currency: string | null
  language: string | null
  notifications: boolean | null
  marketing_emails: boolean | null
  auto_publish_links: boolean | null
  public_profile: boolean | null
  instagram_url: string | null
  tiktok_url: string | null
  youtube_url: string | null
  website_url: string | null
  stripe_account_id: string | null
  stripe_charges_enabled: boolean | null
  role: string | null
  plan: string | null
  videos_used: number | null
  extra_video_credits: number | null
}

type SettingsData = {
  fullName: string
  username: string
  brandName: string
  bio: string
  email: string
  phoneNumber: string
  address: string
  profilePhoto: string
  theme: ThemeType
  currency: string
  language: string
  notifications: boolean
  marketingEmails: boolean
  autoPublishLinks: boolean
  publicProfile: boolean
  instagramUrl: string
  tiktokUrl: string
  youtubeUrl: string
  websiteUrl: string
  stripeAccountId: string
  stripeChargesEnabled: boolean
  role: string
  plan: string
  videosUsed: number
  extraVideoCredits: number
}

const defaultSettings: SettingsData = {
  fullName: "",
  username: "",
  brandName: "CreatorGoat",
  bio: "",
  email: "",
  phoneNumber: "",
  address: "",
  profilePhoto: "",
  theme: "luxury",
  currency: "USD",
  language: "English",
  notifications: true,
  marketingEmails: true,
  autoPublishLinks: false,
  publicProfile: true,
  instagramUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
  websiteUrl: "",
  stripeAccountId: "",
  stripeChargesEnabled: false,
  role: "",
  plan: "starter",
  videosUsed: 0,
  extraVideoCredits: 0,
}

function getPlanVideoLimit(plan: string) {
  const value = (plan || "").toLowerCase().trim()
  if (value === "starter") return 3
  if (value === "pro") return 5
  if (value === "founder" || value === "founder_elite") return 10
  return 0
}

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), [])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [profileId, setProfileId] = useState("")
  const [currentUserId, setCurrentUserId] = useState("")
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [pageError, setPageError] = useState("")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [connectLoading, setConnectLoading] = useState(false)
  const [checkingStripe, setCheckingStripe] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState("")
  const [creditsLoading, setCreditsLoading] = useState("")

  function updateField<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setSaved(false)
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  function applyProfile(row: ProfileRow) {
    setProfileId(row.id)

    setSettings({
      fullName: row.full_name || "",
      username: row.username || "",
      brandName: row.brand_name || "CreatorGoat",
      bio: row.bio || "",
      email: row.email || "",
      phoneNumber: row.phone || "",
      address: row.address || "",
      profilePhoto: row.avatar_url || "",
      theme: row.theme || "luxury",
      currency: row.currency || "USD",
      language: row.language || "English",
      notifications: row.notifications ?? true,
      marketingEmails: row.marketing_emails ?? true,
      autoPublishLinks: row.auto_publish_links ?? false,
      publicProfile: row.public_profile ?? true,
      instagramUrl: row.instagram_url || "",
      tiktokUrl: row.tiktok_url || "",
      youtubeUrl: row.youtube_url || "",
      websiteUrl: row.website_url || "",
      stripeAccountId: row.stripe_account_id || "",
      stripeChargesEnabled: row.stripe_charges_enabled ?? false,
      role: row.role || "",
      plan: row.plan || "starter",
      videosUsed: row.videos_used ?? 0,
      extraVideoCredits: row.extra_video_credits ?? 0,
    })
  }

  async function ensureProfileForUser(userId: string, email: string | null) {
    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (existingError) {
      throw new Error(existingError.message || "Failed to load profile.")
    }

    if (existing) {
      return existing as ProfileRow
    }

    const insertPayload = {
      id: userId,
      full_name: "",
      username: "",
      brand_name: "CreatorGoat",
      bio: "",
      email: email || "",
      phone: "",
      address: "",
      avatar_url: "",
      theme: "luxury",
      currency: "USD",
      language: "English",
      notifications: true,
      marketing_emails: true,
      auto_publish_links: false,
      public_profile: true,
      instagram_url: "",
      tiktok_url: "",
      youtube_url: "",
      website_url: "",
      stripe_account_id: "",
      stripe_charges_enabled: false,
      plan: "starter",
      videos_used: 0,
      extra_video_credits: 0,
    }

    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .insert([insertPayload])
      .select()
      .single()

    if (insertError) {
      throw new Error(insertError.message || "Failed to create profile.")
    }

    return inserted as ProfileRow
  }

  async function loadProfile() {
    try {
      setLoading(true)
      setPageError("")

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setPageError("Please log in to view settings.")
        return
      }

      setCurrentUserId(session.user.id)

      const profile = await ensureProfileForUser(
        session.user.id,
        session.user.email || null
      )

      applyProfile(profile)
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Failed to load settings."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProfile()
  }, [])

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.access_token || ""
  }

  async function handleAvatarUpload(file: File) {
    try {
      setUploadingAvatar(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        alert("Please log in first.")
        return
      }

      const userId = session.user.id
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
      const safeExtension = extension === "jpeg" ? "jpg" : extension
      const filePath = `${userId}/avatar-${Date.now()}.${safeExtension}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
          contentType: file.type || "image/jpeg",
        })

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload photo.")
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)

      const publicUrl = publicUrlData?.publicUrl || ""

      if (!publicUrl) {
        throw new Error("Could not get public avatar URL.")
      }

      updateField("profilePhoto", publicUrl)

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId)

      if (profileError) {
        throw new Error(profileError.message || "Failed to save avatar URL.")
      }

      setSaved(true)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to upload photo.")
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function onAvatarFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image.")
      e.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large. Max 5MB.")
      e.target.value = ""
      return
    }

    await handleAvatarUpload(file)
    e.target.value = ""
  }

  async function removeProfilePhoto() {
    if (!profileId) return

    try {
      updateField("profilePhoto", "")

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", profileId)

      if (error) {
        throw new Error(error.message || "Failed to remove profile photo.")
      }

      setSaved(true)
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to remove profile photo."
      )
    }
  }

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!profileId) {
      alert("No profile loaded yet.")
      return
    }

    const payload = {
      full_name: settings.fullName || null,
      username: settings.username || null,
      brand_name: settings.brandName || null,
      bio: settings.bio || null,
      email: settings.email || null,
      phone: settings.phoneNumber || null,
      address: settings.address || null,
      avatar_url: settings.profilePhoto || null,
      theme: settings.theme,
      currency: settings.currency,
      language: settings.language,
      notifications: settings.notifications,
      marketing_emails: settings.marketingEmails,
      auto_publish_links: settings.autoPublishLinks,
      public_profile: settings.publicProfile,
      instagram_url: settings.instagramUrl || null,
      tiktok_url: settings.tiktokUrl || null,
      youtube_url: settings.youtubeUrl || null,
      website_url: settings.websiteUrl || null,
      stripe_account_id: settings.stripeAccountId || null,
      stripe_charges_enabled: settings.stripeChargesEnabled,
      plan: settings.plan || "starter",
      videos_used: settings.videosUsed,
      extra_video_credits: settings.extraVideoCredits,
    }

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", profileId)

    if (error) {
      alert(`Failed to save settings. ${error.message}`)
      return
    }

    setSaved(true)
    await loadProfile()
  }

  async function handleConnectStripe() {
    try {
      setConnectLoading(true)

      const accessToken = await getAccessToken()

      if (!accessToken) {
        alert("Please log in first.")
        return
      }

      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          stripeAccountId: settings.stripeAccountId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to connect Stripe.")
      }

      if (data?.accountId) {
        updateField("stripeAccountId", data.accountId)
      }

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to connect Stripe.")
    } finally {
      setConnectLoading(false)
    }
  }

  async function handleRefreshStripeStatus() {
    try {
      if (!settings.stripeAccountId) {
        alert("No Stripe account connected yet.")
        return
      }

      setCheckingStripe(true)

      const response = await fetch("/api/stripe/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stripeAccountId: settings.stripeAccountId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to check Stripe status.")
      }

      const isReady = Boolean(data?.chargesEnabled) && Boolean(data?.payoutsEnabled)

      updateField("stripeAccountId", data?.accountId || settings.stripeAccountId)
      updateField("stripeChargesEnabled", isReady)

      if (profileId) {
        await supabase
          .from("profiles")
          .update({
            stripe_account_id: data?.accountId || settings.stripeAccountId,
            stripe_charges_enabled: isReady,
          })
          .eq("id", profileId)
      }
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to check Stripe status."
      )
    } finally {
      setCheckingStripe(false)
    }
  }

  async function handleSubscribe(plan: "starter" | "pro" | "founder") {
    try {
      setSubscriptionLoading(plan)

      const accessToken = await getAccessToken()

      if (!accessToken) {
        alert("Please log in first.")
        return
      }

      const response = await fetch("/api/stripe/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to start subscription.")
      }

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to subscribe.")
    } finally {
      setSubscriptionLoading("")
    }
  }

  async function handleBuyCredits(creditPack: "5" | "10" | "25") {
    try {
      setCreditsLoading(creditPack)

      const accessToken = await getAccessToken()

      if (!accessToken) {
        alert("Please log in first.")
        return
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ creditPack }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to buy credits.")
      }

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to buy credits.")
    } finally {
      setCreditsLoading("")
    }
  }

  const profileCompletion = useMemo(() => {
    let score = 0
    if (settings.fullName.trim()) score += 10
    if (settings.username.trim()) score += 10
    if (settings.brandName.trim()) score += 10
    if (settings.bio.trim()) score += 10
    if (settings.email.trim()) score += 10
    if (settings.phoneNumber.trim()) score += 10
    if (settings.address.trim()) score += 10
    if (settings.profilePhoto.trim()) score += 10
    if (settings.stripeAccountId.trim()) score += 10
    if (settings.stripeChargesEnabled) score += 10
    return Math.round(score)
  }, [settings])

  const includedVideos = getPlanVideoLimit(settings.plan)
  const remainingIncludedVideos = Math.max(includedVideos - settings.videosUsed, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-black px-8 py-10 text-white">
        <div className="mx-auto max-w-6xl rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8 text-zinc-400">
          Loading settings...
        </div>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-black px-8 py-10 text-white">
        <div className="mx-auto max-w-6xl rounded-3xl border border-red-500/20 bg-zinc-950 p-8">
          <h1 className="text-3xl font-bold text-red-400">Settings</h1>
          <p className="mt-4 text-zinc-300">{pageError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
          <h1 className="text-4xl font-bold text-yellow-400">Settings</h1>
          <p className="mt-3 text-zinc-400">
            Manage your CreatorGoat workspace, creator identity, Stripe payouts,
            subscriptions, credits, and account information.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="Theme" value={settings.theme} />
          <InfoCard label="Currency" value={settings.currency} />
          <InfoCard label="Language" value={settings.language} />
          <InfoCard label="Profile Completion" value={`${profileCompletion}%`} />
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="Current Plan" value={settings.plan} />
          <InfoCard label="Included Videos" value={`${includedVideos}`} />
          <InfoCard label="Videos Used" value={`${settings.videosUsed}`} />
          <InfoCard label="Extra Credits" value={`${settings.extraVideoCredits}`} />
        </section>

        <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-yellow-400">Video Access Summary</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <InfoCard label="Included Remaining" value={`${remainingIncludedVideos}`} />
            <InfoCard label="Extra Credits" value={`${settings.extraVideoCredits}`} />
            <InfoCard
              label="Total Remaining"
              value={`${remainingIncludedVideos + settings.extraVideoCredits}`}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-yellow-400">Subscription Plans</h2>
          <p className="mt-3 text-sm text-zinc-400">
            Starter includes 3 videos, Pro includes 5 videos, Founder Elite includes 10 videos.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ActionCard
              title="$9 Starter"
              subtitle="3 videos per month"
              buttonLabel={subscriptionLoading === "starter" ? "Loading..." : "Choose Starter"}
              onClick={() => handleSubscribe("starter")}
              disabled={subscriptionLoading !== ""}
            />
            <ActionCard
              title="$19 Pro"
              subtitle="5 videos per month"
              buttonLabel={subscriptionLoading === "pro" ? "Loading..." : "Choose Pro"}
              onClick={() => handleSubscribe("pro")}
              disabled={subscriptionLoading !== ""}
            />
            <ActionCard
              title="$29 Founder Elite"
              subtitle="10 videos per month"
              buttonLabel={subscriptionLoading === "founder" ? "Loading..." : "Choose Founder"}
              onClick={() => handleSubscribe("founder")}
              disabled={subscriptionLoading !== ""}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold text-yellow-400">Buy Extra Video Credits</h2>
          <p className="mt-3 text-sm text-zinc-400">
            When your plan videos are finished, users can buy extra credits.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ActionCard
              title="5 Credits"
              subtitle="$9"
              buttonLabel={creditsLoading === "5" ? "Loading..." : "Buy 5 Credits"}
              onClick={() => handleBuyCredits("5")}
              disabled={creditsLoading !== ""}
            />
            <ActionCard
              title="10 Credits"
              subtitle="$15"
              buttonLabel={creditsLoading === "10" ? "Loading..." : "Buy 10 Credits"}
              onClick={() => handleBuyCredits("10")}
              disabled={creditsLoading !== ""}
            />
            <ActionCard
              title="25 Credits"
              subtitle="$29"
              buttonLabel={creditsLoading === "25" ? "Loading..." : "Buy 25 Credits"}
              onClick={() => handleBuyCredits("25")}
              disabled={creditsLoading !== ""}
            />
          </div>
        </section>

        <form onSubmit={saveSettings} className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
              <h2 className="text-2xl font-bold text-yellow-400">Identity & Brand</h2>

              <div className="mt-6 grid gap-4">
                <input
                  type="text"
                  placeholder="Full name"
                  value={settings.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={settings.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Brand name"
                  value={settings.brandName}
                  onChange={(e) => updateField("brandName", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                />
                <textarea
                  placeholder="Brand bio"
                  value={settings.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  className="min-h-[140px] w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                />
              </div>
            </section>

            <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
              <h2 className="text-2xl font-bold text-yellow-400">Profile & Contact</h2>

              <div className="mt-6 grid gap-5">
                <div className="flex flex-col items-start gap-4 rounded-3xl border border-yellow-500/20 bg-black/20 p-5">
                  <div className="relative h-28 w-28 overflow-hidden rounded-full border border-yellow-500/20 bg-zinc-900">
                    {settings.profilePhoto ? (
                      <img
                        src={settings.profilePhoto}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl text-yellow-400">
                        👤
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-500 text-lg text-black shadow-lg disabled:opacity-50"
                      title="Upload profile photo"
                    >
                      {uploadingAvatar ? "..." : "📷"}
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onAvatarFileChange}
                    className="hidden"
                  />

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                    >
                      {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                    </button>

                    <button
                      type="button"
                      onClick={removeProfilePhoto}
                      disabled={uploadingAvatar || !settings.profilePhoto}
                      className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 disabled:opacity-50"
                    >
                      Remove Photo
                    </button>
                  </div>

                  <p className="text-sm text-zinc-500">
                    Profile photo is saved in Supabase Storage and linked to your account.
                  </p>
                </div>

                <input
                  type="email"
                  placeholder="Email"
                  value={settings.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                />

                <input
                  type="text"
                  placeholder="Phone number"
                  value={settings.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                />

                <textarea
                  placeholder="Address"
                  value={settings.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="min-h-[120px] w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                />
              </div>
            </section>

            <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
              <h2 className="text-2xl font-bold text-yellow-400">Social Links</h2>

              <div className="mt-6 grid gap-4">
                <input
                  type="text"
                  placeholder="Instagram URL"
                  value={settings.instagramUrl}
                  onChange={(e) => updateField("instagramUrl", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="TikTok URL"
                  value={settings.tiktokUrl}
                  onChange={(e) => updateField("tiktokUrl", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="YouTube URL"
                  value={settings.youtubeUrl}
                  onChange={(e) => updateField("youtubeUrl", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Website URL"
                  value={settings.websiteUrl}
                  onChange={(e) => updateField("websiteUrl", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                />
              </div>
            </section>

            <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
              <h2 className="text-2xl font-bold text-yellow-400">Platform Preferences</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <select
                  value={settings.theme}
                  onChange={(e) => updateField("theme", e.target.value as ThemeType)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                >
                  <option value="dark">dark</option>
                  <option value="luxury">luxury</option>
                </select>

                <select
                  value={settings.currency}
                  onChange={(e) => updateField("currency", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>

                <select
                  value={settings.language}
                  onChange={(e) => updateField("language", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                >
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Haitian Creole">Haitian Creole</option>
                  <option value="Spanish">Spanish</option>
                </select>

                <select
                  value={settings.plan}
                  onChange={(e) => updateField("plan", e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                >
                  <option value="starter">starter</option>
                  <option value="pro">pro</option>
                  <option value="founder">founder</option>
                  <option value="founder_elite">founder_elite</option>
                </select>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
              <h2 className="text-2xl font-bold text-yellow-400">Toggles</h2>

              <div className="mt-6 space-y-4">
                <ToggleRow
                  label="Notifications"
                  value={settings.notifications}
                  onChange={(value) => updateField("notifications", value)}
                />
                <ToggleRow
                  label="Marketing Emails"
                  value={settings.marketingEmails}
                  onChange={(value) => updateField("marketingEmails", value)}
                />
                <ToggleRow
                  label="Auto Publish Links"
                  value={settings.autoPublishLinks}
                  onChange={(value) => updateField("autoPublishLinks", value)}
                />
                <ToggleRow
                  label="Public Profile"
                  value={settings.publicProfile}
                  onChange={(value) => updateField("publicProfile", value)}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
              <h2 className="text-2xl font-bold text-yellow-400">Stripe Payouts</h2>

              <p className="mt-3 text-sm text-zinc-400">
                Connect Stripe so customers can pay and payouts can go to your seller account.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleConnectStripe}
                  disabled={connectLoading}
                  className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black disabled:opacity-50"
                >
                  {connectLoading
                    ? "Connecting..."
                    : settings.stripeAccountId
                    ? "Continue Stripe Onboarding"
                    : "Connect Stripe"}
                </button>

                <button
                  type="button"
                  onClick={handleRefreshStripeStatus}
                  disabled={checkingStripe || !settings.stripeAccountId}
                  className="rounded-xl border border-yellow-500/30 px-5 py-3 font-semibold text-yellow-400 disabled:opacity-50"
                >
                  {checkingStripe ? "Checking..." : "Refresh Stripe Status"}
                </button>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
                  <p className="text-xs text-zinc-500">Stripe Account ID</p>
                  <p className="mt-1 break-all text-zinc-300">
                    {settings.stripeAccountId || "Not connected"}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
                  <p className="text-xs text-zinc-500">Payout Status</p>
                  <p className="mt-1 text-zinc-300">
                    {checkingStripe
                      ? "Checking Stripe status..."
                      : settings.stripeChargesEnabled
                      ? "Ready to receive payouts"
                      : "Stripe onboarding not completed"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
              <h2 className="text-2xl font-bold text-yellow-400">Quick Account View</h2>

              <div className="mt-6 space-y-4 text-sm text-zinc-300">
                <QuickField label="Full Name" value={settings.fullName} />
                <QuickField label="Username" value={settings.username} />
                <QuickField label="Email" value={settings.email} />
                <QuickField label="Phone" value={settings.phoneNumber} />
                <QuickField label="Address" value={settings.address} />
                <QuickField label="Plan" value={settings.plan} />
                <QuickField label="Role" value={settings.role} />
                <QuickField label="Current User ID" value={currentUserId} />
              </div>
            </section>

            <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
              <h2 className="text-2xl font-bold text-yellow-400">Save Settings</h2>

              <p className="mt-3 text-sm text-zinc-400">
                Save your current workspace configuration, payout settings, and account preferences.
              </p>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black"
              >
                Save All Settings
              </button>

              {saved ? (
                <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
                  Settings saved successfully.
                </div>
              ) : null}
            </section>
          </div>
        </form>
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-yellow-400">{value}</p>
    </div>
  )
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black/20 p-4">
      <p className="font-medium text-white">{label}</p>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={
          value
            ? "rounded-full bg-yellow-500 px-4 py-2 text-sm font-medium text-black"
            : "rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300"
        }
      >
        {value ? "On" : "Off"}
      </button>
    </div>
  )
}

function QuickField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 whitespace-pre-wrap">{value || "Not added"}</p>
    </div>
  )
}

function ActionCard({
  title,
  subtitle,
  buttonLabel,
  onClick,
  disabled,
}: {
  title: string
  subtitle: string
  buttonLabel: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-zinc-900/60 p-5">
      <p className="text-lg font-bold text-yellow-400">{title}</p>
      <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="mt-5 w-full rounded-xl bg-yellow-500 px-4 py-3 font-semibold text-black disabled:opacity-50"
      >
        {buttonLabel}
      </button>
    </div>
  )
}