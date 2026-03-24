export type UserPlan = "free" | "starter" | "pro" | "founder" | "founder_elite"

export type AccessProfile = {
  plan?: string | null
  trial_expires_at?: string | null
  subscription_expires_at?: string | null
}

export type AccessCheckOptions = {
  alwaysFree?: boolean
  founderOnly?: boolean
  blockedWhenFree?: boolean
}

export type AccessCheckResult = {
  allowed: boolean
  reason: string
  normalizedPlan: UserPlan
  founderAccess: boolean
  trialExpired: boolean
  subscriptionExpired: boolean
}

export function normalizePlan(plan?: string | null): UserPlan {
  const value = (plan || "").toLowerCase().trim()

  if (value === "starter") return "starter"
  if (value === "pro") return "pro"
  if (value === "founder" || value === "founder_elite" || value === "elite") {
    return "founder_elite"
  }

  return "free"
}

export function getPlanDisplay(plan?: string | null) {
  const value = normalizePlan(plan)

  if (value === "starter") return "$9 Starter"
  if (value === "pro") return "$19 Pro"
  if (value === "founder_elite") return "$29 Founder Elite"
  return "Free Trial"
}

export function isExpired(dateValue?: string | null) {
  if (!dateValue) return false
  return Date.now() > new Date(dateValue).getTime()
}

export function getTrialCountdown(trialExpiresAt?: string | null) {
  if (!trialExpiresAt) {
    return {
      expired: true,
      remainingMinutes: 0,
      remainingSeconds: 0,
    }
  }

  const nowMs = Date.now()
  const expiresMs = new Date(trialExpiresAt).getTime()
  const remainingMs = Math.max(expiresMs - nowMs, 0)

  return {
    expired: remainingMs <= 0,
    remainingMinutes: Math.floor(remainingMs / 1000 / 60),
    remainingSeconds: Math.floor((remainingMs / 1000) % 60),
  }
}

export function checkModuleAccess(
  profile: AccessProfile,
  options?: AccessCheckOptions
): AccessCheckResult {
  const normalizedPlan = normalizePlan(profile.plan)
  const founderAccess = normalizedPlan === "founder_elite"
  const trialExpired = isExpired(profile.trial_expires_at)
  const subscriptionExpired =
    normalizedPlan !== "free" ? isExpired(profile.subscription_expires_at) : false

  if (options?.alwaysFree) {
    return {
      allowed: true,
      reason: "",
      normalizedPlan,
      founderAccess,
      trialExpired,
      subscriptionExpired,
    }
  }

  if (normalizedPlan === "free") {
    if (options?.founderOnly) {
      return {
        allowed: false,
        reason: "This module requires Founder Elite.",
        normalizedPlan,
        founderAccess,
        trialExpired,
        subscriptionExpired,
      }
    }

    if (options?.blockedWhenFree) {
      return {
        allowed: false,
        reason: trialExpired
          ? "Your free trial has ended. Upgrade Now."
          : "This module requires a paid plan.",
        normalizedPlan,
        founderAccess,
        trialExpired,
        subscriptionExpired,
      }
    }

    if (trialExpired) {
      return {
        allowed: false,
        reason: "Your free trial has ended. Upgrade Now.",
        normalizedPlan,
        founderAccess,
        trialExpired,
        subscriptionExpired,
      }
    }

    return {
      allowed: true,
      reason: "",
      normalizedPlan,
      founderAccess,
      trialExpired,
      subscriptionExpired,
    }
  }

  if (subscriptionExpired) {
    return {
      allowed: false,
      reason: "Your plan has expired. Renew to continue.",
      normalizedPlan,
      founderAccess,
      trialExpired,
      subscriptionExpired,
    }
  }

  if (options?.founderOnly && !founderAccess) {
    return {
      allowed: false,
      reason: "This module requires Founder Elite.",
      normalizedPlan,
      founderAccess,
      trialExpired,
      subscriptionExpired,
    }
  }

  return {
    allowed: true,
    reason: "",
    normalizedPlan,
    founderAccess,
    trialExpired,
    subscriptionExpired,
  }
}