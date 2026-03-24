export function getAffiliateRef(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("affiliate_ref") || ""
}

export function setAffiliateRef(code: string) {
  if (typeof window === "undefined") return
  if (!code) return
  localStorage.setItem("affiliate_ref", code)
}

export function clearAffiliateRef() {
  if (typeof window === "undefined") return
  localStorage.removeItem("affiliate_ref")
}