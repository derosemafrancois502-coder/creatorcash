import crypto from "crypto"
import type { Product } from "@/lib/product-sources/tiktok"

const AMAZON_HOST = "webservices.amazon.com"
const AMAZON_REGION = "us-east-1"
const AMAZON_SERVICE = "ProductAdvertisingAPI"
const AMAZON_TARGET = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems"
const AMAZON_URI = "/paapi5/searchitems"

function sha256(data: string) {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex")
}

function hmac(key: Buffer | string, data: string) {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest()
}

function getAmzDate(date = new Date()) {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, "")
  return {
    amzDate: iso,
    dateStamp: iso.slice(0, 8),
  }
}

function getSigningKey(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string
) {
  const kDate = hmac(`AWS4${secretKey}`, dateStamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, service)
  return hmac(kService, "aws4_request")
}

function getAmazonPrice(item: any) {
  const offerV2Amount = item?.OffersV2?.Listings?.[0]?.Price?.Amount
  const offerAmount = item?.Offers?.Listings?.[0]?.Price?.Amount

  const parsed =
    Number(offerV2Amount ?? 0) || Number(offerAmount ?? 0) || 0

  return parsed
}

function getAmazonImage(item: any) {
  return (
    item?.Images?.Primary?.Large?.URL ||
    item?.Images?.Primary?.Medium?.URL ||
    item?.Images?.Primary?.Small?.URL ||
    ""
  )
}

function getAmazonCategory(item: any) {
  return (
    item?.BrowseNodeInfo?.BrowseNodes?.[0]?.DisplayName ||
    item?.ItemInfo?.Classifications?.Binding?.DisplayValue ||
    item?.ItemInfo?.ProductInfo?.Color?.DisplayValue ||
    "General"
  )
}

function getAmazonDetailPage(item: any, asin: string) {
  return item?.DetailPageURL || `https://www.amazon.com/dp/${asin}`
}

function normalizeAmazonItem(item: any, index: number): Product | null {
  const asin = item?.ASIN
  const title = item?.ItemInfo?.Title?.DisplayValue
  const image = getAmazonImage(item)
  const amount = getAmazonPrice(item)

  if (!asin || !title || !amount) {
    return null
  }

  const category = getAmazonCategory(item)
  const detailPage = getAmazonDetailPage(item, asin)

  return {
    id: `amazon-${asin}`,
    name: title,
    price: amount,
    image,
    rating: 4.5,
    reviews: "N/A",
    estimatedSales: "N/A",
    competition: index < 4 ? "Low" : index < 8 ? "Medium" : "High",
    trendScore: Math.max(78, 96 - index * 2),
    category,
    whyItsHot: "Live Amazon catalog result.",
    contentAngle:
      "Lead with the problem, show the product fast, highlight the benefit, then close with CTA.",
    source: "Amazon",
    url: detailPage,
  }
}

async function safeJson(response: Response) {
  const text = await response.text()

  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return { raw: text }
  }
}

export async function searchAmazonProducts(query: string): Promise<Product[]> {
  const cleanQuery = query.trim()

  if (!cleanQuery) {
    return []
  }

  const accessKey = process.env.AMAZON_PAAPI_ACCESS_KEY?.trim()
  const secretKey = process.env.AMAZON_PAAPI_SECRET_KEY?.trim()
  const associateTag = process.env.AMAZON_ASSOCIATE_TAG?.trim()

  if (!accessKey || !secretKey || !associateTag) {
    console.error("Amazon credentials missing.")
    return []
  }

  const payloadObj = {
    Keywords: cleanQuery,
    SearchIndex: "All",
    ItemCount: 10,
    PartnerTag: associateTag,
    PartnerType: "Associates",
    Marketplace: "www.amazon.com",
    Resources: [
      "Images.Primary.Large",
      "Images.Primary.Medium",
      "Images.Primary.Small",
      "ItemInfo.Title",
      "ItemInfo.Classifications",
      "BrowseNodeInfo.BrowseNodes",
      "OffersV2.Listings.Price",
      "Offers.Listings.Price",
    ],
  }

  const payload = JSON.stringify(payloadObj)
  const { amzDate, dateStamp } = getAmzDate()

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${AMAZON_HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${AMAZON_TARGET}\n`

  const signedHeaders =
    "content-encoding;content-type;host;x-amz-date;x-amz-target"

  const canonicalRequest = [
    "POST",
    AMAZON_URI,
    "",
    canonicalHeaders,
    signedHeaders,
    sha256(payload),
  ].join("\n")

  const algorithm = "AWS4-HMAC-SHA256"
  const credentialScope = `${dateStamp}/${AMAZON_REGION}/${AMAZON_SERVICE}/aws4_request`

  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n")

  const signingKey = getSigningKey(
    secretKey,
    dateStamp,
    AMAZON_REGION,
    AMAZON_SERVICE
  )

  const signature = crypto
    .createHmac("sha256", signingKey)
    .update(stringToSign, "utf8")
    .digest("hex")

  const authorizationHeader =
    `${algorithm} ` +
    `Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signature}`

  const res = await fetch(`https://${AMAZON_HOST}${AMAZON_URI}`, {
    method: "POST",
    headers: {
      "Content-Encoding": "amz-1.0",
      "Content-Type": "application/json; charset=utf-8",
      Host: AMAZON_HOST,
      "X-Amz-Date": amzDate,
      "X-Amz-Target": AMAZON_TARGET,
      Authorization: authorizationHeader,
    },
    body: payload,
    cache: "no-store",
  })

  const json = await safeJson(res)

  if (!res.ok) {
    console.error("Amazon SearchItems error:", json)
    return []
  }

  const items = Array.isArray(json?.SearchResult?.Items)
    ? json.SearchResult.Items
    : []

  return items
    .map((item: any, index: number) => normalizeAmazonItem(item, index))
    .filter((item: Product | null): item is Product => Boolean(item))
}