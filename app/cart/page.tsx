"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import StoreNavbar from "@/components/store-navbar"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import { getCart, subscribeToCart, CartItem } from "@/lib/cart"
import { createClient } from "@/lib/supabase/client"
import {
  ArrowLeft,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Tag,
  MapPin,
  Pencil,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

type ShippingMethod = "pickup" | "standard" | "express"

type CartVariantItem = CartItem & {
  color?: string | null
  size?: string | null
}

type ShippingAddress = {
  fullName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  country: string
}

type ProfileRow = {
  shipping_address?: ShippingAddress | null
}

const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.04,
  AK: 0.0,
  AZ: 0.056,
  AR: 0.065,
  CA: 0.0725,
  CO: 0.029,
  CT: 0.0635,
  DE: 0.0,
  FL: 0.06,
  GA: 0.04,
  HI: 0.04,
  ID: 0.06,
  IL: 0.0625,
  IN: 0.07,
  IA: 0.06,
  KS: 0.065,
  KY: 0.06,
  LA: 0.0445,
  ME: 0.055,
  MD: 0.06,
  MA: 0.0625,
  MI: 0.06,
  MN: 0.06875,
  MS: 0.07,
  MO: 0.04225,
  MT: 0.0,
  NE: 0.055,
  NV: 0.0685,
  NH: 0.0,
  NJ: 0.06625,
  NM: 0.05125,
  NY: 0.04,
  NC: 0.0475,
  ND: 0.05,
  OH: 0.0575,
  OK: 0.045,
  OR: 0.0,
  PA: 0.06,
  RI: 0.07,
  SC: 0.06,
  SD: 0.045,
  TN: 0.07,
  TX: 0.0625,
  UT: 0.061,
  VT: 0.06,
  VA: 0.053,
  WA: 0.065,
  WV: 0.06,
  WI: 0.05,
  WY: 0.04,
}

const COUNTRIES = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cabo Verde" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo (DRC)" },
  { code: "CR", name: "Costa Rica" },
  { code: "CI", name: "Côte d’Ivoire" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "KP", name: "North Korea" },
  { code: "MK", name: "North Macedonia" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PS", name: "Palestine" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VA", name: "Vatican City" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
]

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
]

const CANADA_PROVINCES = [
  "AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT",
]

const CUBA_PROVINCES = [
  "Pinar del Río",
  "Artemisa",
  "La Habana",
  "Mayabeque",
  "Matanzas",
  "Cienfuegos",
  "Villa Clara",
  "Sancti Spíritus",
  "Ciego de Ávila",
  "Camagüey",
  "Las Tunas",
  "Holguín",
  "Granma",
  "Santiago de Cuba",
  "Guantánamo",
  "Isla de la Juventud",
]

function getShippingFee(method: ShippingMethod, subtotal: number) {
  if (method === "pickup") return 0
  if (method === "standard") return subtotal > 50 ? 0 : 6.99
  if (method === "express") return 14.99
  return 0
}

function getVariantKey(item: CartVariantItem) {
  return `${item.id}__${item.color || "no-color"}__${item.size || "no-size"}`
}

function emitCartRefresh() {
  if (typeof window === "undefined") return

  try {
    window.dispatchEvent(new Event("storage"))
  } catch {}

  try {
    window.dispatchEvent(new Event("cart-updated"))
  } catch {}
}

function getDefaultShippingAddress(): ShippingAddress {
  return {
    fullName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "KY",
    postalCode: "",
    country: "US",
  }
}

function normalizeShippingAddress(input: unknown): ShippingAddress {
  if (!input || typeof input !== "object") {
    return getDefaultShippingAddress()
  }

  const raw = input as Partial<ShippingAddress>

  return {
    fullName: typeof raw.fullName === "string" ? raw.fullName : "",
    email: typeof raw.email === "string" ? raw.email : "",
    phone: typeof raw.phone === "string" ? raw.phone : "",
    address1: typeof raw.address1 === "string" ? raw.address1 : "",
    address2: typeof raw.address2 === "string" ? raw.address2 : "",
    city: typeof raw.city === "string" ? raw.city : "",
    state: typeof raw.state === "string" ? raw.state : "KY",
    postalCode: typeof raw.postalCode === "string" ? raw.postalCode : "",
    country: typeof raw.country === "string" ? raw.country : "US",
  }
}

function isAddressFilled(address: ShippingAddress) {
  return Boolean(
    address.fullName.trim() &&
      address.email.trim() &&
      address.address1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.postalCode.trim() &&
      address.country.trim()
  )
}

function getRegionLabel(country: string) {
  if (country === "US") return "State"
  if (country === "CA") return "Province"
  if (country === "CU") return "Province"
  return "Region / State / Province"
}

function getPostalLabel(country: string) {
  if (country === "US") return "ZIP Code"
  if (country === "CA") return "Postal Code"
  if (country === "CU") return "Postal Code"
  return "Postal Code"
}

function getRegionOptions(country: string) {
  if (country === "US") return US_STATES
  if (country === "CA") return CANADA_PROVINCES
  if (country === "CU") return CUBA_PROVINCES
  return []
}

export default function CartPage() {
  const supabase = useMemo(() => createClient(), [])

  const [cart, setCart] = useState<CartVariantItem[]>([])
  const [checkingOut, setCheckingOut] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("standard")
  const [stateCode, setStateCode] = useState("KY")
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(
    getDefaultShippingAddress()
  )
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [hasSavedAddress, setHasSavedAddress] = useState(false)

  useEffect(() => {
    function refreshCart() {
      setCart((getCart() as CartVariantItem[]) || [])
    }

    refreshCart()
    const unsubscribe = subscribeToCart(refreshCart)
    return unsubscribe
  }, [])

  useEffect(() => {
    async function loadSavedAddress() {
      try {
        setLoadingAddress(true)

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          setHasSavedAddress(false)
          setShowAddressForm(false)
          return
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("shipping_address")
          .eq("id", user.id)
          .maybeSingle()

        if (error) {
          console.error("Load shipping address error:", error)
          setHasSavedAddress(false)
          setShowAddressForm(false)
          return
        }

        const profile = data as ProfileRow | null
        const nextAddress = normalizeShippingAddress(profile?.shipping_address)

        if (isAddressFilled(nextAddress)) {
          setShippingAddress(nextAddress)
          setHasSavedAddress(true)
          setShowAddressForm(false)

          if (
            nextAddress.country === "US" &&
            nextAddress.state &&
            STATE_TAX_RATES[nextAddress.state]
          ) {
            setStateCode(nextAddress.state)
          } else {
            setStateCode("KY")
          }
        } else {
          setHasSavedAddress(false)
          setShowAddressForm(false)
        }
      } catch (error) {
        console.error("Unexpected load shipping address error:", error)
        setHasSavedAddress(false)
        setShowAddressForm(false)
      } finally {
        setLoadingAddress(false)
      }
    }

    void loadSavedAddress()
  }, [supabase])

  function saveCart(nextCart: CartVariantItem[]) {
    setCart(nextCart)
    localStorage.setItem("creatorgoat-cart", JSON.stringify(nextCart))
    emitCartRefresh()
  }

  function updateVariantQuantity(itemToUpdate: CartVariantItem, change: number) {
    const currentCart = (getCart() as CartVariantItem[]) || []
    const targetKey = getVariantKey(itemToUpdate)

    const nextCart = currentCart
      .map((item) => {
        if (getVariantKey(item) !== targetKey) return item

        const nextQuantity = Number(item.quantity || 0) + change
        return {
          ...item,
          quantity: nextQuantity,
        }
      })
      .filter((item) => Number(item.quantity || 0) > 0)

    saveCart(nextCart)
  }

  function removeVariantItem(itemToRemove: CartVariantItem) {
    const currentCart = (getCart() as CartVariantItem[]) || []
    const targetKey = getVariantKey(itemToRemove)

    const nextCart = currentCart.filter(
      (item) => getVariantKey(item) !== targetKey
    )

    saveCart(nextCart)
  }

  function updateShippingField<K extends keyof ShippingAddress>(
    key: K,
    value: ShippingAddress[K]
  ) {
    setShippingAddress((prev) => {
      const next = {
        ...prev,
        [key]: value,
      }

      if (key === "country" && typeof value === "string") {
        if (value === "US") {
          next.state = "KY"
          setStateCode("KY")
        } else if (value === "CA") {
          next.state = "ON"
          setStateCode("KY")
        } else if (value === "CU") {
          next.state = "La Habana"
          setStateCode("KY")
        } else {
          next.state = ""
          setStateCode("KY")
        }
      }

      if (key === "state" && typeof value === "string") {
        if (next.country === "US") {
          setStateCode(value || "KY")
        } else {
          setStateCode("KY")
        }
      }

      return next
    })
  }

  async function handleSaveAddress() {
    if (!validateShippingAddress()) return

    try {
      setSavingAddress(true)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        alert("Please sign in to save your shipping address.")
        return
      }

      const payload = {
        shipping_address: shippingAddress,
      }

      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id)

      if (error) {
        console.error("Save shipping address error:", error)
        alert(error.message || "Could not save shipping address.")
        return
      }

      setHasSavedAddress(true)
      setShowAddressForm(false)
    } catch (error) {
      console.error("Unexpected save shipping address error:", error)
      alert("Could not save shipping address.")
    } finally {
      setSavingAddress(false)
    }
  }

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    )
  }, [cart])

  const taxRate = useMemo(() => {
    if (shippingAddress.country === "US") {
      return STATE_TAX_RATES[stateCode] ?? 0.06
    }
    return 0
  }, [stateCode, shippingAddress.country])

  const shipping = useMemo(() => {
    return cart.length > 0 ? getShippingFee(shippingMethod, subtotal) : 0
  }, [cart.length, shippingMethod, subtotal])

  const tax = useMemo(() => {
    return subtotal * taxRate
  }, [subtotal, taxRate])

  const total = useMemo(() => {
    return subtotal + shipping + tax
  }, [subtotal, shipping, tax])

  const itemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  }, [cart])

  const regionOptions = useMemo(
    () => getRegionOptions(shippingAddress.country),
    [shippingAddress.country]
  )

  function validateShippingAddress() {
    if (shippingMethod === "pickup") return true

    if (!shippingAddress.fullName.trim()) {
      alert("Please enter full name.")
      return false
    }

    if (!shippingAddress.email.trim()) {
      alert("Please enter email.")
      return false
    }

    if (!shippingAddress.address1.trim()) {
      alert("Please enter shipping address.")
      return false
    }

    if (!shippingAddress.city.trim()) {
      alert("Please enter city.")
      return false
    }

    if (!shippingAddress.state.trim()) {
      alert(`Please enter ${getRegionLabel(shippingAddress.country).toLowerCase()}.`)
      return false
    }

    if (!shippingAddress.postalCode.trim()) {
      alert(`Please enter ${getPostalLabel(shippingAddress.country).toLowerCase()}.`)
      return false
    }

    return true
  }

  async function handleCheckout() {
    if (cart.length === 0) {
      alert("Your cart is empty.")
      return
    }

    if (!validateShippingAddress()) {
      setShowAddressForm(true)
      return
    }

    try {
      setCheckingOut(true)

      const raw = localStorage.getItem("creatorgoat-settings")
      const parsed = raw ? JSON.parse(raw) : null
      const sellerStripeAccountId = parsed?.stripeAccountId || ""

      if (!sellerStripeAccountId) {
        alert("Stripe account not connected yet.")
        return
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          shippingMethod,
          stateCode: shippingAddress.country === "US" ? stateCode : "",
          sellerStripeAccountId,
          shippingAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Failed to start checkout.")
      }

      if (!data?.url) {
        throw new Error("No checkout URL returned.")
      }

      window.location.href = data.url
    } catch (error) {
      console.error("Checkout error:", error)
      alert(
        error instanceof Error
          ? error.message
          : "Checkout failed. Please try again."
      )
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24 text-zinc-900 md:pb-0">
      <StoreNavbar />
      <MobileBottomNav />

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/marketplace/explore"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-600/80">
              CreatorGoat
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950 md:text-5xl">
              Your Cart
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500 md:text-base">
              Review your selected items, update quantities, add shipping details,
              and continue to secure checkout.
            </p>
          </div>

          {cart.length > 0 ? (
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700">
              <ShoppingCart className="h-4 w-4" />
              {itemCount} item{itemCount !== 1 ? "s" : ""} in cart
            </div>
          ) : null}
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50">
              <ShoppingCart className="h-7 w-7 text-yellow-600" />
            </div>

            <h2 className="text-2xl font-semibold text-zinc-950 md:text-3xl">
              Your cart is empty
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-500">
              Browse the marketplace and add premium products before checkout.
            </p>

            <Link
              href="/marketplace/explore"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
            >
              Go to Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={getVariantKey(item)}
                  className="grid gap-4 rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-[120px_1fr_auto]"
                >
                  <div className="overflow-hidden rounded-2xl bg-zinc-100">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-[120px] w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-[120px] items-center justify-center text-zinc-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-zinc-950 md:text-xl">
                      {item.name}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                      Premium marketplace item
                    </p>

                    {(item.color || item.size) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.color ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
                            <Tag className="h-3.5 w-3.5" />
                            Color: {item.color}
                          </span>
                        ) : null}

                        {item.size ? (
                          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
                            Size: {item.size}
                          </span>
                        ) : null}
                      </div>
                    )}

                    <p className="mt-3 text-lg font-semibold text-yellow-600">
                      ${Number(item.price).toFixed(2)}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center overflow-hidden rounded-full border border-zinc-300 bg-white">
                        <button
                          type="button"
                          onClick={() => updateVariantQuantity(item, -1)}
                          className="flex h-10 w-10 items-center justify-center text-zinc-900 transition hover:bg-zinc-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <div className="min-w-[48px] text-center text-sm font-semibold text-zinc-950">
                          {item.quantity}
                        </div>

                        <button
                          type="button"
                          onClick={() => updateVariantQuantity(item, 1)}
                          className="flex h-10 w-10 items-center justify-center text-zinc-900 transition hover:bg-zinc-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeVariantItem(item)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xs uppercase tracking-[0.15em] text-zinc-400">
                      Item Total
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-zinc-950">
                      ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                      ${Number(item.price).toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}

              <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-50">
                      <MapPin className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600/80">
                        Shipping
                      </p>
                      <h2 className="mt-1 text-xl font-semibold text-zinc-950">
                        Customer Shipping Address
                      </h2>
                    </div>
                  </div>

                  {shippingMethod !== "pickup" ? (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
                    >
                      <MapPin className="h-4 w-4" />
                      {showAddressForm ? "Hide Shipping Address" : "Add Your Shipping Address"}
                      {showAddressForm ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  ) : null}
                </div>

                {shippingMethod === "pickup" ? (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                    Local pickup selected. Shipping address is not required for pickup.
                  </div>
                ) : loadingAddress ? (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                    Loading saved shipping address...
                  </div>
                ) : (
                  <div className="space-y-5">
                    {hasSavedAddress ? (
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm font-semibold">
                              Saved shipping address
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowAddressForm((prev) => !prev)}
                            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                          >
                            <Pencil className="h-4 w-4" />
                            {showAddressForm ? "Close Edit" : "Edit Address"}
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <SavedRow label="Full Name" value={shippingAddress.fullName} />
                          <SavedRow label="Email" value={shippingAddress.email} />
                          <SavedRow label="Phone" value={shippingAddress.phone || "—"} />
                          <SavedRow
                            label="Country"
                            value={
                              COUNTRIES.find(
                                (country) => country.code === shippingAddress.country
                              )?.name || shippingAddress.country
                            }
                          />
                          <SavedRow
                            className="md:col-span-2"
                            label="Address Line 1"
                            value={shippingAddress.address1}
                          />
                          <SavedRow
                            className="md:col-span-2"
                            label="Address Line 2"
                            value={shippingAddress.address2 || "—"}
                          />
                          <SavedRow label="City" value={shippingAddress.city} />
                          <SavedRow
                            label={getRegionLabel(shippingAddress.country)}
                            value={shippingAddress.state}
                          />
                          <SavedRow
                            label={getPostalLabel(shippingAddress.country)}
                            value={shippingAddress.postalCode}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-600">
                        No shipping address saved yet. Click <span className="font-semibold text-zinc-900">Add Your Shipping Address</span> to enter it once.
                      </div>
                    )}

                    {showAddressForm ? (
                      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-zinc-950">
                            Shipping Address Form
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            Save it once. The system keeps it in your account for next orders.
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <InputField
                            label="Full Name"
                            value={shippingAddress.fullName}
                            onChange={(value) => updateShippingField("fullName", value)}
                            placeholder="Customer full name"
                          />

                          <InputField
                            label="Email"
                            value={shippingAddress.email}
                            onChange={(value) => updateShippingField("email", value)}
                            placeholder="customer@email.com"
                            type="email"
                          />

                          <InputField
                            label="Phone"
                            value={shippingAddress.phone}
                            onChange={(value) => updateShippingField("phone", value)}
                            placeholder="(555) 555-5555"
                          />

                          <div>
                            <label className="mb-2 block text-sm text-zinc-500">
                              Country
                            </label>
                            <select
                              value={shippingAddress.country}
                              onChange={(e) =>
                                updateShippingField("country", e.target.value)
                              }
                              className="w-full rounded-2xl border border-zinc-300 bg-white p-3 text-zinc-900 outline-none transition focus:border-yellow-500/40"
                            >
                              {COUNTRIES.map((country) => (
                                <option key={country.code} value={country.code}>
                                  {country.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <InputField
                              label="Address Line 1"
                              value={shippingAddress.address1}
                              onChange={(value) => updateShippingField("address1", value)}
                              placeholder="Street address"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <InputField
                              label="Address Line 2"
                              value={shippingAddress.address2}
                              onChange={(value) => updateShippingField("address2", value)}
                              placeholder="Apartment, suite, unit, building"
                            />
                          </div>

                          <InputField
                            label="City"
                            value={shippingAddress.city}
                            onChange={(value) => updateShippingField("city", value)}
                            placeholder="City"
                          />

                          {regionOptions.length > 0 ? (
                            <div>
                              <label className="mb-2 block text-sm text-zinc-500">
                                {getRegionLabel(shippingAddress.country)}
                              </label>
                              <select
                                value={shippingAddress.state}
                                onChange={(e) =>
                                  updateShippingField("state", e.target.value)
                                }
                                className="w-full rounded-2xl border border-zinc-300 bg-white p-3 text-zinc-900 outline-none transition focus:border-yellow-500/40"
                              >
                                {regionOptions.map((region) => (
                                  <option key={region} value={region}>
                                    {region}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <InputField
                              label={getRegionLabel(shippingAddress.country)}
                              value={shippingAddress.state}
                              onChange={(value) => updateShippingField("state", value)}
                              placeholder={getRegionLabel(shippingAddress.country)}
                            />
                          )}

                          <InputField
                            label={getPostalLabel(shippingAddress.country)}
                            value={shippingAddress.postalCode}
                            onChange={(value) =>
                              updateShippingField("postalCode", value)
                            }
                            placeholder={getPostalLabel(shippingAddress.country)}
                          />

                          <div className="md:col-span-2 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => void handleSaveAddress()}
                              disabled={savingAddress}
                              className="inline-flex items-center justify-center rounded-2xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-50"
                            >
                              {savingAddress ? "Saving..." : "Save Shipping Address"}
                            </button>

                            <button
                              type="button"
                              onClick={() => setShowAddressForm(false)}
                              className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <aside>
              <div className="sticky top-24 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-md">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-600/80">
                  Summary
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-zinc-500">
                      Shipping Method
                    </label>
                    <select
                      value={shippingMethod}
                      onChange={(e) =>
                        setShippingMethod(e.target.value as ShippingMethod)
                      }
                      className="w-full rounded-2xl border border-zinc-300 bg-white p-3 text-zinc-900 outline-none transition focus:border-yellow-500/40"
                    >
                      <option value="pickup">Local Pickup (Free)</option>
                      <option value="standard">
                        Standard Shipping {subtotal > 50 ? "(Free over $50)" : "($6.99)"}
                      </option>
                      <option value="express">Express Shipping ($14.99)</option>
                    </select>
                  </div>

                  {shippingAddress.country === "US" ? (
                    <div>
                      <label className="mb-2 block text-sm text-zinc-500">
                        Tax State
                      </label>
                      <select
                        value={stateCode}
                        onChange={(e) => {
                          setStateCode(e.target.value)
                          updateShippingField("state", e.target.value)
                        }}
                        className="w-full rounded-2xl border border-zinc-300 bg-white p-3 text-zinc-900 outline-none transition focus:border-yellow-500/40"
                      >
                        {Object.keys(STATE_TAX_RATES).map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                      Tax is currently calculated for U.S. shipping states only.
                    </div>
                  )}

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="space-y-3 text-sm">
                      <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                      <SummaryRow label="Shipping" value={`$${shipping.toFixed(2)}`} />
                      <SummaryRow
                        label={`Tax (${(taxRate * 100).toFixed(2)}%)`}
                        value={`$${tax.toFixed(2)}`}
                      />
                    </div>

                    <div className="mt-4 border-t border-zinc-200 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-zinc-950">Total</span>
                        <span className="text-2xl font-semibold text-yellow-600">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleCheckout()}
                  disabled={checkingOut}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-yellow-500 px-6 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkingOut ? "Redirecting..." : "Proceed to Checkout"}
                </button>

                <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-950">
                        Secure Checkout Flow
                      </p>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">
                        Customer shipping address, shipping method, tax, and payment
                        confirmation continue in the secure checkout flow.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/marketplace/explore"
                  className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-zinc-300 bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  Continue Shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-zinc-300 bg-white p-3 text-zinc-900 outline-none transition focus:border-yellow-500/40"
      />
    </div>
  )
}

function SavedRow({
  label,
  value,
  className = "",
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-900">{value}</p>
    </div>
  )
}

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-950">{value}</span>
    </div>
  )
}