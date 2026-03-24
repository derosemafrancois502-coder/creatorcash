import Stripe from "stripe"

let stripeInstance: Stripe | null = null

function getStripeInstance() {
  if (stripeInstance) return stripeInstance

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing.")
  }

  stripeInstance = new Stripe(stripeSecretKey)

  return stripeInstance
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const instance = getStripeInstance()
    const value = (instance as any)[prop]

    if (typeof value === "function") {
      return value.bind(instance)
    }

    return value
  },
})