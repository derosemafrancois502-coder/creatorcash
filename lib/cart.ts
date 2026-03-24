export type CartItem = {
  id: string
  name: string
  price: number
  image_url: string | null
  quantity: number
  color?: string | null
  size?: string | null
}

const CART_KEY = "creatorgoat-cart"
const CART_EVENT = "cart-updated"

function getVariantKey(item: Pick<CartItem, "id" | "color" | "size">) {
  return `${item.id}__${item.color || "no-color"}__${item.size || "no-size"}`
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(CART_KEY)
    const parsed = raw ? JSON.parse(raw) : []

    if (!Array.isArray(parsed)) return []

    return parsed.map((item) => ({
      id: String(item.id || ""),
      name: String(item.name || ""),
      price: Number(item.price || 0),
      image_url: item.image_url || null,
      quantity: Math.max(1, Number(item.quantity || 1)),
      color: item.color || null,
      size: item.size || null,
    }))
  } catch {
    return []
  }
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0)
}

export function setCart(cart: CartItem[]) {
  if (typeof window === "undefined") return

  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new Event(CART_EVENT))
}

export function addItemToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  const currentCart = getCart()
  const incomingKey = getVariantKey(item)

  const existing = currentCart.find(
    (cartItem) => getVariantKey(cartItem) === incomingKey
  )

  let updatedCart: CartItem[]

  if (existing) {
    updatedCart = currentCart.map((cartItem) =>
      getVariantKey(cartItem) === incomingKey
        ? { ...cartItem, quantity: cartItem.quantity + Math.max(1, quantity) }
        : cartItem
    )
  } else {
    updatedCart = [
      ...currentCart,
      {
        ...item,
        quantity: Math.max(1, quantity),
        color: item.color || null,
        size: item.size || null,
      },
    ]
  }

  setCart(updatedCart)
}

export function updateCartQuantity(
  target:
    | string
    | {
        id: string
        color?: string | null
        size?: string | null
      },
  change: number
) {
  const currentCart = getCart()

  const targetKey =
    typeof target === "string"
      ? `${target}__no-color__no-size`
      : getVariantKey({
          id: target.id,
          color: target.color || null,
          size: target.size || null,
        })

  const updatedCart = currentCart
    .map((item) =>
      getVariantKey(item) === targetKey
        ? { ...item, quantity: item.quantity + change }
        : item
    )
    .filter((item) => item.quantity > 0)

  setCart(updatedCart)
}

export function removeCartItem(
  target:
    | string
    | {
        id: string
        color?: string | null
        size?: string | null
      }
) {
  const currentCart = getCart()

  if (typeof target === "string") {
    const updatedCart = currentCart.filter((item) => item.id !== target)
    setCart(updatedCart)
    return
  }

  const targetKey = getVariantKey({
    id: target.id,
    color: target.color || null,
    size: target.size || null,
  })

  const updatedCart = currentCart.filter(
    (item) => getVariantKey(item) !== targetKey
  )

  setCart(updatedCart)
}

export function clearCart() {
  setCart([])
}

export function subscribeToCart(callback: () => void) {
  if (typeof window === "undefined") return () => {}

  window.addEventListener(CART_EVENT, callback)
  window.addEventListener("storage", callback)

  return () => {
    window.removeEventListener(CART_EVENT, callback)
    window.removeEventListener("storage", callback)
  }
}