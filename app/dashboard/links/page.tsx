"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type LinkItem = {
  id: string
  user_id?: string
  title: string
  url: string
  slug: string | null
  description: string | null
  is_active: boolean
  clicks: number
  created_at: string
}

const languages = [
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "Arabic",
  "Hindi",
  "Creole",
] as const

type Language = (typeof languages)[number]

const translations: Record<
  Language,
  {
    pageTitle: string
    pageDescription: string
    totalLinks: string
    activeLinks: string
    inactiveLinks: string
    totalClicks: string
    addLink: string
    addLinkDescription: string
    linkTitlePlaceholder: string
    urlPlaceholder: string
    descriptionPlaceholder: string
    addLinkButton: string
    yourLinks: string
    yourLinksDescription: string
    searchPlaceholder: string
    noLinks: string
    noDescription: string
    addedLabel: string
    clicksLabel: string
    setInactive: string
    setActive: string
    openLink: string
    deleteLink: string
    active: string
    inactive: string
    languageLabel: string
    linkTitleRequired: string
    urlRequired: string
    deleteConfirm: string
    loadError: string
    saveError: string
    deleteError: string
    updateError: string
    loadingLabel: string
  }
> = {
  English: {
    pageTitle: "Links",
    pageDescription:
      "Build your creator links page and manage the destinations you want people to visit.",
    totalLinks: "Total Links",
    activeLinks: "Active Links",
    inactiveLinks: "Inactive Links",
    totalClicks: "Total Clicks",
    addLink: "Add Link",
    addLinkDescription: "Add storefront, product, affiliate, or social links.",
    linkTitlePlaceholder: "Link title",
    urlPlaceholder: "URL",
    descriptionPlaceholder: "Description",
    addLinkButton: "Add Link",
    yourLinks: "Your Links",
    yourLinksDescription: "Activate, deactivate, preview, and track your links.",
    searchPlaceholder: "Search links...",
    noLinks: "No links yet.",
    noDescription: "No description",
    addedLabel: "Added",
    clicksLabel: "Clicks",
    setInactive: "Set Inactive",
    setActive: "Set Active",
    openLink: "Open Link",
    deleteLink: "Delete Link",
    active: "Active",
    inactive: "Inactive",
    languageLabel: "Language",
    linkTitleRequired: "Link title is required.",
    urlRequired: "URL is required.",
    deleteConfirm: "Delete this link?",
    loadError: "Failed to load links.",
    saveError: "Failed to save link.",
    deleteError: "Failed to delete link.",
    updateError: "Failed to update link.",
    loadingLabel: "Loading links...",
  },
  French: {
    pageTitle: "Liens",
    pageDescription:
      "Créez votre page de liens créateur et gérez les destinations que vous voulez montrer.",
    totalLinks: "Total des liens",
    activeLinks: "Liens actifs",
    inactiveLinks: "Liens inactifs",
    totalClicks: "Clics totaux",
    addLink: "Ajouter un lien",
    addLinkDescription:
      "Ajoutez des liens de boutique, produit, affiliation ou réseaux sociaux.",
    linkTitlePlaceholder: "Titre du lien",
    urlPlaceholder: "URL",
    descriptionPlaceholder: "Description",
    addLinkButton: "Ajouter un lien",
    yourLinks: "Vos liens",
    yourLinksDescription:
      "Activez, désactivez, prévisualisez et suivez vos liens.",
    searchPlaceholder: "Rechercher des liens...",
    noLinks: "Aucun lien pour le moment.",
    noDescription: "Aucune description",
    addedLabel: "Ajouté",
    clicksLabel: "Clics",
    setInactive: "Désactiver",
    setActive: "Activer",
    openLink: "Ouvrir le lien",
    deleteLink: "Supprimer le lien",
    active: "Actif",
    inactive: "Inactif",
    languageLabel: "Langue",
    linkTitleRequired: "Le titre du lien est requis.",
    urlRequired: "L'URL est requise.",
    deleteConfirm: "Supprimer ce lien ?",
    loadError: "Échec du chargement des liens.",
    saveError: "Échec de l'enregistrement du lien.",
    deleteError: "Échec de la suppression du lien.",
    updateError: "Échec de la mise à jour du lien.",
    loadingLabel: "Chargement des liens...",
  },
  Spanish: {
    pageTitle: "Enlaces",
    pageDescription:
      "Crea tu página de enlaces de creador y administra los destinos que quieres mostrar.",
    totalLinks: "Enlaces totales",
    activeLinks: "Enlaces activos",
    inactiveLinks: "Enlaces inactivos",
    totalClicks: "Clics totales",
    addLink: "Agregar enlace",
    addLinkDescription:
      "Agrega enlaces de tienda, producto, afiliado o redes sociales.",
    linkTitlePlaceholder: "Título del enlace",
    urlPlaceholder: "URL",
    descriptionPlaceholder: "Descripción",
    addLinkButton: "Agregar enlace",
    yourLinks: "Tus enlaces",
    yourLinksDescription:
      "Activa, desactiva, vista previa y rastrea tus enlaces.",
    searchPlaceholder: "Buscar enlaces...",
    noLinks: "Aún no hay enlaces.",
    noDescription: "Sin descripción",
    addedLabel: "Agregado",
    clicksLabel: "Clics",
    setInactive: "Desactivar",
    setActive: "Activar",
    openLink: "Abrir enlace",
    deleteLink: "Eliminar enlace",
    active: "Activo",
    inactive: "Inactivo",
    languageLabel: "Idioma",
    linkTitleRequired: "El título del enlace es obligatorio.",
    urlRequired: "La URL es obligatoria.",
    deleteConfirm: "¿Eliminar este enlace?",
    loadError: "No se pudieron cargar los enlaces.",
    saveError: "No se pudo guardar el enlace.",
    deleteError: "No se pudo eliminar el enlace.",
    updateError: "No se pudo actualizar el enlace.",
    loadingLabel: "Cargando enlaces...",
  },
  Portuguese: {
    pageTitle: "Links",
    pageDescription:
      "Crie sua página de links de criador e gerencie os destinos que você quer mostrar.",
    totalLinks: "Total de links",
    activeLinks: "Links ativos",
    inactiveLinks: "Links inativos",
    totalClicks: "Cliques totais",
    addLink: "Adicionar link",
    addLinkDescription:
      "Adicione links de loja, produto, afiliado ou redes sociais.",
    linkTitlePlaceholder: "Título do link",
    urlPlaceholder: "URL",
    descriptionPlaceholder: "Descrição",
    addLinkButton: "Adicionar link",
    yourLinks: "Seus links",
    yourLinksDescription:
      "Ative, desative, visualize e acompanhe seus links.",
    searchPlaceholder: "Pesquisar links...",
    noLinks: "Ainda não há links.",
    noDescription: "Sem descrição",
    addedLabel: "Adicionado",
    clicksLabel: "Cliques",
    setInactive: "Desativar",
    setActive: "Ativar",
    openLink: "Abrir link",
    deleteLink: "Excluir link",
    active: "Ativo",
    inactive: "Inativo",
    languageLabel: "Idioma",
    linkTitleRequired: "O título do link é obrigatório.",
    urlRequired: "A URL é obrigatória.",
    deleteConfirm: "Excluir este link?",
    loadError: "Falha ao carregar links.",
    saveError: "Falha ao salvar link.",
    deleteError: "Falha ao excluir link.",
    updateError: "Falha ao atualizar link.",
    loadingLabel: "Carregando links...",
  },
  Arabic: {
    pageTitle: "الروابط",
    pageDescription:
      "أنشئ صفحة روابطك كمنشئ محتوى وأدر الوجهات التي تريد أن يزورها الناس.",
    totalLinks: "إجمالي الروابط",
    activeLinks: "الروابط النشطة",
    inactiveLinks: "الروابط غير النشطة",
    totalClicks: "إجمالي النقرات",
    addLink: "إضافة رابط",
    addLinkDescription:
      "أضف روابط المتجر أو المنتج أو التسويق بالعمولة أو الشبكات الاجتماعية.",
    linkTitlePlaceholder: "عنوان الرابط",
    urlPlaceholder: "الرابط",
    descriptionPlaceholder: "الوصف",
    addLinkButton: "إضافة رابط",
    yourLinks: "روابطك",
    yourLinksDescription: "فعّل، عطّل، عاين وتتبع روابطك.",
    searchPlaceholder: "ابحث في الروابط...",
    noLinks: "لا توجد روابط بعد.",
    noDescription: "لا يوجد وصف",
    addedLabel: "تمت الإضافة",
    clicksLabel: "النقرات",
    setInactive: "تعطيل",
    setActive: "تفعيل",
    openLink: "فتح الرابط",
    deleteLink: "حذف الرابط",
    active: "نشط",
    inactive: "غير نشط",
    languageLabel: "اللغة",
    linkTitleRequired: "عنوان الرابط مطلوب.",
    urlRequired: "الرابط مطلوب.",
    deleteConfirm: "هل تريد حذف هذا الرابط؟",
    loadError: "فشل تحميل الروابط.",
    saveError: "فشل حفظ الرابط.",
    deleteError: "فشل حذف الرابط.",
    updateError: "فشل تحديث الرابط.",
    loadingLabel: "جارٍ تحميل الروابط...",
  },
  Hindi: {
    pageTitle: "लिंक्स",
    pageDescription:
      "अपना creator links page बनाएं और उन जगहों को मैनेज करें जहाँ आप लोगों को भेजना चाहते हैं।",
    totalLinks: "कुल लिंक्स",
    activeLinks: "सक्रिय लिंक्स",
    inactiveLinks: "निष्क्रिय लिंक्स",
    totalClicks: "कुल क्लिक",
    addLink: "लिंक जोड़ें",
    addLinkDescription:
      "स्टोरफ्रंट, प्रोडक्ट, एफिलिएट या सोशल लिंक जोड़ें।",
    linkTitlePlaceholder: "लिंक शीर्षक",
    urlPlaceholder: "URL",
    descriptionPlaceholder: "विवरण",
    addLinkButton: "लिंक जोड़ें",
    yourLinks: "आपके लिंक्स",
    yourLinksDescription:
      "अपने लिंक्स को एक्टिव, इनएक्टिव, प्रीव्यू और ट्रैक करें।",
    searchPlaceholder: "लिंक्स खोजें...",
    noLinks: "अभी तक कोई लिंक नहीं है।",
    noDescription: "कोई विवरण नहीं",
    addedLabel: "जोड़ा गया",
    clicksLabel: "क्लिक्स",
    setInactive: "निष्क्रिय करें",
    setActive: "सक्रिय करें",
    openLink: "लिंक खोलें",
    deleteLink: "लिंक हटाएँ",
    active: "सक्रिय",
    inactive: "निष्क्रिय",
    languageLabel: "भाषा",
    linkTitleRequired: "लिंक शीर्षक जरूरी है।",
    urlRequired: "URL जरूरी है।",
    deleteConfirm: "क्या इस लिंक को हटाना है?",
    loadError: "लिंक्स लोड नहीं हो सके।",
    saveError: "लिंक सेव नहीं हो सका।",
    deleteError: "लिंक हटाया नहीं जा सका।",
    updateError: "लिंक अपडेट नहीं हो सका।",
    loadingLabel: "लिंक्स लोड हो रहे हैं...",
  },
  Creole: {
    pageTitle: "Lyen",
    pageDescription:
      "Bati paj lyen creator ou a epi jere kote ou vle moun ale.",
    totalLinks: "Total lyen",
    activeLinks: "Lyen aktif",
    inactiveLinks: "Lyen inaktif",
    totalClicks: "Total klik",
    addLink: "Ajoute lyen",
    addLinkDescription:
      "Ajoute lyen storefront, pwodwi, afilye, oswa sosyal.",
    linkTitlePlaceholder: "Tit lyen an",
    urlPlaceholder: "URL",
    descriptionPlaceholder: "Deskripsyon",
    addLinkButton: "Ajoute lyen",
    yourLinks: "Lyen ou yo",
    yourLinksDescription:
      "Aktive, dezaktive, preview, epi swiv lyen ou yo.",
    searchPlaceholder: "Chèche lyen...",
    noLinks: "Poko gen lyen.",
    noDescription: "Pa gen deskripsyon",
    addedLabel: "Ajoute",
    clicksLabel: "Klik",
    setInactive: "Mete Inaktif",
    setActive: "Mete Aktif",
    openLink: "Louvri lyen",
    deleteLink: "Efase lyen",
    active: "Aktif",
    inactive: "Inaktif",
    languageLabel: "Lang",
    linkTitleRequired: "Tit lyen an obligatwa.",
    urlRequired: "URL la obligatwa.",
    deleteConfirm: "Efase lyen sa a?",
    loadError: "Pa t ka chaje lyen yo.",
    saveError: "Pa t ka sove lyen an.",
    deleteError: "Pa t ka efase lyen an.",
    updateError: "Pa t ka mete lyen an ajou.",
    loadingLabel: "Ap chaje lyen yo...",
  },
}

export default function LinksPage() {
  const supabase = createClient()

  const [links, setLinks] = useState<LinkItem[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [search, setSearch] = useState("")
  const [language, setLanguage] = useState<Language>("English")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const t = translations[language]

  async function getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user ?? null
  }

  async function loadLinks() {
    setLoading(true)

    const user = await getCurrentUser()

    if (!user) {
      setLinks([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("links")
      .select("id, user_id, title, url, slug, description, is_active, clicks, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Load links error:", error.message, error.details, error.hint)
      alert(`${t.loadError} ${error.message}`)
      setLoading(false)
      return
    }

    const normalized = ((data as any[]) || []).map((item) => ({
      ...item,
      slug: item.slug ?? null,
      is_active: item.is_active ?? true,
      clicks: item.clicks ?? 0,
      description: item.description ?? null,
    })) as LinkItem[]

    setLinks(normalized)
    setLoading(false)
  }

  useEffect(() => {
    loadLinks()
  }, [])

  function normalizeUrl(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return ""
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed
    }
    return `https://${trimmed}`
  }

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/https?:\/\//g, "")
      .replace(/www\./g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
  }

  function makeTrackedUrl(slug: string | null) {
    if (!slug) return ""
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/go/${slug}`
  }

  async function addLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!title.trim()) {
      alert(t.linkTitleRequired)
      return
    }

    if (!url.trim()) {
      alert(t.urlRequired)
      return
    }

    const user = await getCurrentUser()
    if (!user) return

    try {
      setSaving(true)

      const cleanUrl = normalizeUrl(url)
      const baseSlug = makeSlug(title.trim() || cleanUrl) || `link-${Date.now()}`
      const uniqueSlug = `${baseSlug}-${Date.now()}`

      const payload = {
        user_id: user.id,
        title: title.trim(),
        url: cleanUrl,
        slug: uniqueSlug,
        description: description.trim() || null,
        is_active: true,
        clicks: 0,
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("links").insert([payload])

      if (error) {
        console.error("Add link error:", error.message, error.details, error.hint)
        alert(`${t.saveError} ${error.message}`)
        return
      }

      setTitle("")
      setUrl("")
      setDescription("")

      await loadLinks()
    } finally {
      setSaving(false)
    }
  }

  async function deleteLink(id: string) {
    const confirmed = window.confirm(t.deleteConfirm)
    if (!confirmed) return

    const user = await getCurrentUser()
    if (!user) return

    const { error } = await supabase
      .from("links")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Delete link error:", error.message, error.details, error.hint)
      alert(`${t.deleteError} ${error.message}`)
      return
    }

    await loadLinks()
  }

  async function toggleLink(id: string, isActive: boolean) {
    const user = await getCurrentUser()
    if (!user) return

    const { error } = await supabase
      .from("links")
      .update({ is_active: !isActive })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Toggle link error:", error.message, error.details, error.hint)
      alert(`${t.updateError} ${error.message}`)
      return
    }

    await loadLinks()
  }

  const filteredLinks = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return links

    return links.filter((link) =>
      [link.title, link.url, link.slug || "", link.description || ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [links, search])

  const stats = useMemo(() => {
    return {
      total: links.length,
      active: links.filter((link) => link.is_active).length,
      inactive: links.filter((link) => !link.is_active).length,
      clicks: links.reduce((sum, link) => sum + link.clicks, 0),
    }
  }, [links])

  return (
    <div className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-yellow-400">{t.pageTitle}</h1>
              <p className="mt-3 text-zinc-400">{t.pageDescription}</p>
            </div>

            <div className="w-full max-w-xs">
              <label className="mb-2 block text-sm text-zinc-400">
                {t.languageLabel}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    🌍 {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t.totalLinks} value={stats.total.toString()} />
          <StatCard label={t.activeLinks} value={stats.active.toString()} />
          <StatCard label={t.inactiveLinks} value={stats.inactive.toString()} />
          <StatCard label={t.totalClicks} value={stats.clicks.toString()} />
        </section>

        <section className="grid gap-8 xl:grid-cols-[1fr_1.4fr]">
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold text-yellow-400">{t.addLink}</h2>
            <p className="mt-2 text-sm text-zinc-400">{t.addLinkDescription}</p>

            <form onSubmit={addLink} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder={t.linkTitlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                required
              />

              <input
                type="text"
                placeholder={t.urlPlaceholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                required
              />

              <textarea
                placeholder={t.descriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[130px] w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black disabled:opacity-50"
              >
                {saving ? "Saving..." : t.addLinkButton}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">{t.yourLinks}</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  {t.yourLinksDescription}
                </p>
              </div>

              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none sm:max-w-xs"
              />
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="rounded-2xl border border-zinc-800 bg-black/20 p-6 text-zinc-500">
                  {t.loadingLabel}
                </div>
              ) : filteredLinks.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-black/20 p-6 text-zinc-500">
                  {t.noLinks}
                </div>
              ) : (
                filteredLinks.map((link) => {
                  const trackedUrl = makeTrackedUrl(link.slug)

                  return (
                    <div
                      key={link.id}
                      className="rounded-2xl border border-zinc-800 bg-black/20 p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-white">
                            {link.title}
                          </h3>
                          <p className="break-all text-sm text-zinc-400">
                            {trackedUrl || link.url}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {link.description || t.noDescription}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {t.addedLabel}: {new Date(link.created_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {t.clicksLabel}: {link.clicks}
                          </p>
                        </div>

                        <div className="flex w-full flex-col gap-3 lg:w-60">
                          <button
                            type="button"
                            onClick={() => toggleLink(link.id, link.is_active)}
                            className={`rounded-xl px-4 py-3 font-medium ${
                              link.is_active
                                ? "border border-yellow-500/30 text-yellow-400"
                                : "border border-zinc-700 text-zinc-300"
                            }`}
                          >
                            {link.is_active ? t.setInactive : t.setActive}
                          </button>

                          <a
                            href={trackedUrl || link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-yellow-500 px-4 py-3 text-center font-semibold text-black"
                          >
                            {t.openLink}
                          </a>

                          <button
                            type="button"
                            onClick={() => deleteLink(link.id)}
                            className="rounded-xl border border-red-500/30 px-4 py-3 font-medium text-red-400"
                          >
                            {t.deleteLink}
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            link.is_active
                              ? "bg-green-500/10 text-green-400"
                              : "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {link.is_active ? t.active : t.inactive}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-yellow-400">{value}</p>
    </div>
  )
}