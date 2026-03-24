"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type LeadStatus = "new" | "contacted" | "qualified" | "closed"

type LinkedLink = {
  id: string
  title: string | null
  url: string | null
  slug: string | null
  clicks: number | null
}

type Lead = {
  id: string
  user_id?: string
  link_id?: string | null
  link_title?: string | null
  link_url?: string | null
  link_slug?: string | null
  name: string | null
  email: string | null
  phone: string | null
  source: string | null
  notes: string | null
  status: LeadStatus | null
  created_at: string | null
  links?: LinkedLink | null
}

type LeadRow = {
  id: string
  user_id?: string
  link_id?: string | null
  link_title?: string | null
  link_url?: string | null
  link_slug?: string | null
  name: string | null
  email: string | null
  phone: string | null
  source: string | null
  notes: string | null
  status: LeadStatus | null
  created_at: string | null
}

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "qualified", "closed"]

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
    totalLeads: string
    newLabel: string
    contactedLabel: string
    qualifiedLabel: string
    closedLabel: string
    addLead: string
    addLeadDescription: string
    fullNamePlaceholder: string
    emailPlaceholder: string
    phonePlaceholder: string
    sourcePlaceholder: string
    notesPlaceholder: string
    addLeadButton: string
    leadPipeline: string
    leadPipelineDescription: string
    searchPlaceholder: string
    noLeads: string
    noEmail: string
    unknownSource: string
    noNotes: string
    addedLabel: string
    sourceLabel: string
    deleteLead: string
    deleteConfirm: string
    leadNameRequired: string
    languageLabel: string
    loadingLabel: string
    saveError: string
    loadError: string
    deleteError: string
    updateError: string
    linkedToLabel: string
    trackedLinkLabel: string
    destinationLabel: string
    noLinkedLink: string
    statusLabels: Record<LeadStatus, string>
  }
> = {
  English: {
    pageTitle: "Leads CRM",
    pageDescription:
      "Capture, organize, and move leads through your CreatorGoat pipeline.",
    totalLeads: "Total Leads",
    newLabel: "New",
    contactedLabel: "Contacted",
    qualifiedLabel: "Qualified",
    closedLabel: "Closed",
    addLead: "Add Lead",
    addLeadDescription: "Add a new customer lead to your pipeline.",
    fullNamePlaceholder: "Full name",
    emailPlaceholder: "Email",
    phonePlaceholder: "Phone",
    sourcePlaceholder: "Source (TikTok, Instagram, Marketplace, etc.)",
    notesPlaceholder: "Notes",
    addLeadButton: "Add Lead",
    leadPipeline: "Lead Pipeline",
    leadPipelineDescription: "Search and manage all saved leads.",
    searchPlaceholder: "Search leads...",
    noLeads: "No leads yet.",
    noEmail: "No email",
    unknownSource: "Unknown",
    noNotes: "No notes",
    addedLabel: "Added",
    sourceLabel: "Source",
    deleteLead: "Delete Lead",
    deleteConfirm: "Delete this lead?",
    leadNameRequired: "Lead name is required.",
    languageLabel: "Language",
    loadingLabel: "Loading leads...",
    saveError: "Failed to save lead.",
    loadError: "Failed to load leads.",
    deleteError: "Failed to delete lead.",
    updateError: "Failed to update lead status.",
    linkedToLabel: "Linked To",
    trackedLinkLabel: "Tracked Link",
    destinationLabel: "Destination",
    noLinkedLink: "No linked link",
    statusLabels: {
      new: "NEW",
      contacted: "CONTACTED",
      qualified: "QUALIFIED",
      closed: "CLOSED",
    },
  },
  French: {
    pageTitle: "CRM des prospects",
    pageDescription:
      "Capturez, organisez et faites avancer vos prospects dans le pipeline CreatorGoat.",
    totalLeads: "Total prospects",
    newLabel: "Nouveaux",
    contactedLabel: "Contactés",
    qualifiedLabel: "Qualifiés",
    closedLabel: "Clôturés",
    addLead: "Ajouter un prospect",
    addLeadDescription: "Ajoutez un nouveau prospect à votre pipeline.",
    fullNamePlaceholder: "Nom complet",
    emailPlaceholder: "Email",
    phonePlaceholder: "Téléphone",
    sourcePlaceholder: "Source (TikTok, Instagram, Marketplace, etc.)",
    notesPlaceholder: "Notes",
    addLeadButton: "Ajouter un prospect",
    leadPipeline: "Pipeline des prospects",
    leadPipelineDescription: "Recherchez et gérez tous les prospects enregistrés.",
    searchPlaceholder: "Rechercher des prospects...",
    noLeads: "Aucun prospect pour le moment.",
    noEmail: "Aucun email",
    unknownSource: "Inconnue",
    noNotes: "Aucune note",
    addedLabel: "Ajouté",
    sourceLabel: "Source",
    deleteLead: "Supprimer le prospect",
    deleteConfirm: "Supprimer ce prospect ?",
    leadNameRequired: "Le nom du prospect est requis.",
    languageLabel: "Langue",
    loadingLabel: "Chargement des prospects...",
    saveError: "Échec de l'enregistrement du prospect.",
    loadError: "Échec du chargement des prospects.",
    deleteError: "Échec de la suppression du prospect.",
    updateError: "Échec de la mise à jour du statut.",
    linkedToLabel: "Lié à",
    trackedLinkLabel: "Lien tracké",
    destinationLabel: "Destination",
    noLinkedLink: "Aucun lien lié",
    statusLabels: {
      new: "NOUVEAU",
      contacted: "CONTACTÉ",
      qualified: "QUALIFIÉ",
      closed: "CLÔTURÉ",
    },
  },
  Spanish: {
    pageTitle: "CRM de prospectos",
    pageDescription:
      "Captura, organiza y mueve prospectos dentro de tu pipeline de CreatorGoat.",
    totalLeads: "Prospectos totales",
    newLabel: "Nuevos",
    contactedLabel: "Contactados",
    qualifiedLabel: "Calificados",
    closedLabel: "Cerrados",
    addLead: "Agregar prospecto",
    addLeadDescription: "Agrega un nuevo prospecto a tu pipeline.",
    fullNamePlaceholder: "Nombre completo",
    emailPlaceholder: "Correo",
    phonePlaceholder: "Teléfono",
    sourcePlaceholder: "Origen (TikTok, Instagram, Marketplace, etc.)",
    notesPlaceholder: "Notas",
    addLeadButton: "Agregar prospecto",
    leadPipeline: "Pipeline de prospectos",
    leadPipelineDescription: "Busca y administra todos los prospectos guardados.",
    searchPlaceholder: "Buscar prospectos...",
    noLeads: "Aún no hay prospectos.",
    noEmail: "Sin correo",
    unknownSource: "Desconocido",
    noNotes: "Sin notas",
    addedLabel: "Agregado",
    sourceLabel: "Origen",
    deleteLead: "Eliminar prospecto",
    deleteConfirm: "¿Eliminar este prospecto?",
    leadNameRequired: "El nombre del prospecto es obligatorio.",
    languageLabel: "Idioma",
    loadingLabel: "Cargando prospectos...",
    saveError: "No se pudo guardar el prospecto.",
    loadError: "No se pudieron cargar los prospectos.",
    deleteError: "No se pudo eliminar el prospecto.",
    updateError: "No se pudo actualizar el estado.",
    linkedToLabel: "Vinculado a",
    trackedLinkLabel: "Link rastreado",
    destinationLabel: "Destino",
    noLinkedLink: "Sin link vinculado",
    statusLabels: {
      new: "NUEVO",
      contacted: "CONTACTADO",
      qualified: "CALIFICADO",
      closed: "CERRADO",
    },
  },
  Portuguese: {
    pageTitle: "CRM de leads",
    pageDescription:
      "Capture, organize e mova leads pelo seu pipeline do CreatorGoat.",
    totalLeads: "Total de leads",
    newLabel: "Novos",
    contactedLabel: "Contatados",
    qualifiedLabel: "Qualificados",
    closedLabel: "Fechados",
    addLead: "Adicionar lead",
    addLeadDescription: "Adicione um novo lead ao seu pipeline.",
    fullNamePlaceholder: "Nome completo",
    emailPlaceholder: "Email",
    phonePlaceholder: "Telefone",
    sourcePlaceholder: "Origem (TikTok, Instagram, Marketplace, etc.)",
    notesPlaceholder: "Notas",
    addLeadButton: "Adicionar lead",
    leadPipeline: "Pipeline de leads",
    leadPipelineDescription: "Pesquise e gerencie todos os leads salvos.",
    searchPlaceholder: "Pesquisar leads...",
    noLeads: "Ainda não há leads.",
    noEmail: "Sem email",
    unknownSource: "Desconhecida",
    noNotes: "Sem notas",
    addedLabel: "Adicionado",
    sourceLabel: "Origem",
    deleteLead: "Excluir lead",
    deleteConfirm: "Excluir este lead?",
    leadNameRequired: "O nome do lead é obrigatório.",
    languageLabel: "Idioma",
    loadingLabel: "Carregando leads...",
    saveError: "Falha ao salvar lead.",
    loadError: "Falha ao carregar leads.",
    deleteError: "Falha ao excluir lead.",
    updateError: "Falha ao atualizar status.",
    linkedToLabel: "Ligado a",
    trackedLinkLabel: "Link rastreado",
    destinationLabel: "Destino",
    noLinkedLink: "Sem link ligado",
    statusLabels: {
      new: "NOVO",
      contacted: "CONTATADO",
      qualified: "QUALIFICADO",
      closed: "FECHADO",
    },
  },
  Arabic: {
    pageTitle: "إدارة العملاء المحتملين",
    pageDescription:
      "التقط العملاء المحتملين ونظمهم وانقلهم عبر مسار CreatorGoat.",
    totalLeads: "إجمالي العملاء المحتملين",
    newLabel: "جديد",
    contactedLabel: "تم التواصل",
    qualifiedLabel: "مؤهل",
    closedLabel: "مغلق",
    addLead: "إضافة عميل محتمل",
    addLeadDescription: "أضف عميلاً محتملاً جديدًا إلى المسار.",
    fullNamePlaceholder: "الاسم الكامل",
    emailPlaceholder: "البريد الإلكتروني",
    phonePlaceholder: "الهاتف",
    sourcePlaceholder: "المصدر (TikTok، Instagram، Marketplace، إلخ)",
    notesPlaceholder: "ملاحظات",
    addLeadButton: "إضافة عميل محتمل",
    leadPipeline: "مسار العملاء المحتملين",
    leadPipelineDescription: "ابحث وأدر جميع العملاء المحتملين المحفوظين.",
    searchPlaceholder: "ابحث عن عملاء محتملين...",
    noLeads: "لا يوجد عملاء محتملون بعد.",
    noEmail: "لا يوجد بريد",
    unknownSource: "غير معروف",
    noNotes: "لا توجد ملاحظات",
    addedLabel: "تمت الإضافة",
    sourceLabel: "المصدر",
    deleteLead: "حذف العميل المحتمل",
    deleteConfirm: "هل تريد حذف هذا العميل المحتمل؟",
    leadNameRequired: "اسم العميل المحتمل مطلوب.",
    languageLabel: "اللغة",
    loadingLabel: "جارٍ تحميل العملاء المحتملين...",
    saveError: "فشل حفظ العميل المحتمل.",
    loadError: "فشل تحميل العملاء المحتملين.",
    deleteError: "فشل حذف العميل المحتمل.",
    updateError: "فشل تحديث الحالة.",
    linkedToLabel: "مرتبط بـ",
    trackedLinkLabel: "الرابط المتتبع",
    destinationLabel: "الوجهة",
    noLinkedLink: "لا يوجد رابط مرتبط",
    statusLabels: {
      new: "جديد",
      contacted: "تم التواصل",
      qualified: "مؤهل",
      closed: "مغلق",
    },
  },
  Hindi: {
    pageTitle: "लीड्स CRM",
    pageDescription:
      "लीड्स को कैप्चर करें, व्यवस्थित करें और CreatorGoat पाइपलाइन में आगे बढ़ाएँ।",
    totalLeads: "कुल लीड्स",
    newLabel: "नई",
    contactedLabel: "संपर्क किया गया",
    qualifiedLabel: "योग्य",
    closedLabel: "क्लोज़्ड",
    addLead: "लीड जोड़ें",
    addLeadDescription: "अपनी पाइपलाइन में एक नई कस्टमर लीड जोड़ें।",
    fullNamePlaceholder: "पूरा नाम",
    emailPlaceholder: "ईमेल",
    phonePlaceholder: "फोन",
    sourcePlaceholder: "स्रोत (TikTok, Instagram, Marketplace, आदि)",
    notesPlaceholder: "नोट्स",
    addLeadButton: "लीड जोड़ें",
    leadPipeline: "लीड पाइपलाइन",
    leadPipelineDescription: "सभी सेव की गई लीड्स खोजें और मैनेज करें।",
    searchPlaceholder: "लीड्स खोजें...",
    noLeads: "अभी तक कोई लीड नहीं है।",
    noEmail: "कोई ईमेल नहीं",
    unknownSource: "अज्ञात",
    noNotes: "कोई नोट नहीं",
    addedLabel: "जोड़ा गया",
    sourceLabel: "स्रोत",
    deleteLead: "लीड हटाएँ",
    deleteConfirm: "क्या इस लीड को हटाना है?",
    leadNameRequired: "लीड का नाम जरूरी है।",
    languageLabel: "भाषा",
    loadingLabel: "लीड्स लोड हो रही हैं...",
    saveError: "लीड सेव नहीं हो सकी।",
    loadError: "लीड्स लोड नहीं हो सकीं।",
    deleteError: "लीड हटाई नहीं जा सकी।",
    updateError: "स्थिति अपडेट नहीं हो सकी।",
    linkedToLabel: "लिंक्ड टू",
    trackedLinkLabel: "ट्रैक्ड लिंक",
    destinationLabel: "डेस्टिनेशन",
    noLinkedLink: "कोई लिंक्ड लिंक नहीं",
    statusLabels: {
      new: "नई",
      contacted: "संपर्क किया गया",
      qualified: "योग्य",
      closed: "क्लोज़्ड",
    },
  },
  Creole: {
    pageTitle: "Leads CRM",
    pageDescription:
      "Kaptire, òganize, epi fè leads yo avanse nan pipeline CreatorGoat ou a.",
    totalLeads: "Total leads",
    newLabel: "Nouvo",
    contactedLabel: "Kontakte",
    qualifiedLabel: "Kalifye",
    closedLabel: "Fèmen",
    addLead: "Ajoute lead",
    addLeadDescription: "Ajoute yon nouvo lead kliyan nan pipeline ou a.",
    fullNamePlaceholder: "Non konplè",
    emailPlaceholder: "Imèl",
    phonePlaceholder: "Telefòn",
    sourcePlaceholder: "Sous (TikTok, Instagram, Marketplace, elatriye)",
    notesPlaceholder: "Nòt",
    addLeadButton: "Ajoute lead",
    leadPipeline: "Pipeline leads",
    leadPipelineDescription: "Chèche epi jere tout leads ki sove yo.",
    searchPlaceholder: "Chèche leads...",
    noLeads: "Poko gen leads.",
    noEmail: "Pa gen imèl",
    unknownSource: "Enkoni",
    noNotes: "Pa gen nòt",
    addedLabel: "Ajoute",
    sourceLabel: "Sous",
    deleteLead: "Efase lead",
    deleteConfirm: "Efase lead sa a?",
    leadNameRequired: "Non lead la obligatwa.",
    languageLabel: "Lang",
    loadingLabel: "Ap chaje leads...",
    saveError: "Pa t ka sove lead la.",
    loadError: "Pa t ka chaje leads yo.",
    deleteError: "Pa t ka efase lead la.",
    updateError: "Pa t ka mete estati a ajou.",
    linkedToLabel: "Konekte ak",
    trackedLinkLabel: "Tracked Link",
    destinationLabel: "Destination",
    noLinkedLink: "Pa gen link konekte",
    statusLabels: {
      new: "NOUVO",
      contacted: "KONTAKTE",
      qualified: "KALIFYE",
      closed: "FÈMEN",
    },
  },
}

export default function LeadsPage() {
  const supabase = createClient()

  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [source, setSource] = useState("")
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<LeadStatus>("new")
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

  function makeTrackedUrl(slug?: string | null) {
    if (!slug) return ""
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/go/${slug}`
  }

  async function loadLeads() {
    try {
      setLoading(true)

      const user = await getCurrentUser()

      if (!user) {
        setLeads([])
        return
      }

      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select(`
          id,
          user_id,
          link_id,
          link_title,
          link_url,
          link_slug,
          name,
          email,
          phone,
          source,
          notes,
          status,
          created_at
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (leadsError) {
        console.error("Load leads error:", leadsError.message, leadsError.details, leadsError.hint)
        alert(`${t.loadError} ${leadsError.message}`)
        setLeads([])
        return
      }

      const safeLeads = (leadsData ?? []) as LeadRow[]
      const linkIds = Array.from(
        new Set(
          safeLeads
            .map((lead) => lead.link_id)
            .filter((value): value is string => Boolean(value))
        )
      )

      let linksMap = new Map<string, LinkedLink>()

      if (linkIds.length > 0) {
        const { data: linksData, error: linksError } = await supabase
          .from("links")
          .select("id, title, url, slug, clicks")
          .in("id", linkIds)

        if (linksError) {
          console.error(
            "Load linked links error:",
            linksError.message,
            linksError.details,
            linksError.hint
          )
        } else {
          linksMap = new Map(
            ((linksData ?? []) as LinkedLink[]).map((link) => [link.id, link])
          )
        }
      }

      const mergedLeads: Lead[] = safeLeads.map((lead) => {
        const linked = lead.link_id ? linksMap.get(lead.link_id) ?? null : null

        return {
          ...lead,
          links: linked
            ? linked
            : lead.link_title || lead.link_url || lead.link_slug
            ? {
                id: lead.link_id ?? "",
                title: lead.link_title ?? null,
                url: lead.link_url ?? null,
                slug: lead.link_slug ?? null,
                clicks: null,
              }
            : null,
        }
      })

      setLeads(mergedLeads)
    } catch (error) {
      console.error("Load leads crash:", error)
      alert(t.loadError)
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeads()
  }, [])

  async function addLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!name.trim()) {
      alert(t.leadNameRequired)
      return
    }

    const user = await getCurrentUser()
    if (!user) return

    try {
      setSaving(true)

      const payload = {
        user_id: user.id,
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        source: source.trim() || "manual",
        notes: notes.trim() || null,
        status,
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("leads").insert([payload])

      if (error) {
        console.error("Add lead error message:", error.message)
        console.error("Add lead error details:", error.details)
        console.error("Add lead error hint:", error.hint)
        alert(`${t.saveError} ${error.message}`)
        return
      }

      setName("")
      setEmail("")
      setPhone("")
      setSource("")
      setNotes("")
      setStatus("new")

      await loadLeads()
    } finally {
      setSaving(false)
    }
  }

  async function deleteLead(id: string) {
    const confirmed = window.confirm(t.deleteConfirm)
    if (!confirmed) return

    const user = await getCurrentUser()
    if (!user) return

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Delete lead error:", error.message, error.details, error.hint)
      alert(`${t.deleteError} ${error.message}`)
      return
    }

    await loadLeads()
  }

  async function updateLeadStatus(id: string, nextStatus: LeadStatus) {
    const user = await getCurrentUser()
    if (!user) return

    const { error } = await supabase
      .from("leads")
      .update({ status: nextStatus })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Update lead status error:", error.message, error.details, error.hint)
      alert(`${t.updateError} ${error.message}`)
      return
    }

    await loadLeads()
  }

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return leads

    return leads.filter((lead) =>
      [
        lead.name || "",
        lead.email || "",
        lead.phone || "",
        lead.source || "",
        lead.notes || "",
        lead.status || "",
        lead.links?.title || "",
        lead.links?.url || "",
        lead.links?.slug || "",
        lead.link_title || "",
        lead.link_url || "",
        lead.link_slug || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [leads, search])

  const stats = useMemo(() => {
    return {
      total: leads.length,
      new: leads.filter((lead) => lead.status === "new").length,
      contacted: leads.filter((lead) => lead.status === "contacted").length,
      qualified: leads.filter((lead) => lead.status === "qualified").length,
      closed: leads.filter((lead) => lead.status === "closed").length,
    }
  }, [leads])

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

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label={t.totalLeads} value={stats.total} />
          <StatCard label={t.newLabel} value={stats.new} />
          <StatCard label={t.contactedLabel} value={stats.contacted} />
          <StatCard label={t.qualifiedLabel} value={stats.qualified} />
          <StatCard label={t.closedLabel} value={stats.closed} />
        </section>

        <section className="grid gap-8 xl:grid-cols-[1fr_1.4fr]">
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold text-yellow-400">{t.addLead}</h2>
            <p className="mt-2 text-sm text-zinc-400">{t.addLeadDescription}</p>

            <form onSubmit={addLead} className="mt-6 space-y-4">
              <input
                type="text"
                placeholder={t.fullNamePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                required
              />

              <input
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
              />

              <input
                type="text"
                placeholder={t.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
              />

              <input
                type="text"
                placeholder={t.sourcePlaceholder}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
              />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {t.statusLabels[option]}
                  </option>
                ))}
              </select>

              <textarea
                placeholder={t.notesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[130px] w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black disabled:opacity-50"
              >
                {saving ? "Saving..." : t.addLeadButton}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">
                  {t.leadPipeline}
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  {t.leadPipelineDescription}
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
              ) : filteredLeads.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-black/20 p-6 text-zinc-500">
                  {t.noLeads}
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const trackedUrl = makeTrackedUrl(
                    lead.links?.slug || lead.link_slug || null
                  )

                  return (
                    <div
                      key={lead.id}
                      className="rounded-2xl border border-zinc-800 bg-black/20 p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-white">
                            {lead.name || "Unknown Lead"}
                          </h3>

                          <p className="text-sm text-zinc-400">
                            {lead.email || t.noEmail}
                            {lead.phone ? ` • ${lead.phone}` : ""}
                          </p>

                          <p className="text-sm text-zinc-500">
                            {t.sourceLabel}: {lead.source || t.unknownSource}
                          </p>

                          <p className="text-sm text-zinc-400">
                            {lead.notes || t.noNotes}
                          </p>

                          <p className="text-xs text-zinc-500">
                            {t.addedLabel}:{" "}
                            {lead.created_at
                              ? new Date(lead.created_at).toLocaleString()
                              : "—"}
                          </p>

                          <div className="mt-4 rounded-2xl border border-yellow-500/10 bg-zinc-900/70 p-4">
                            <p className="text-xs uppercase tracking-wide text-zinc-500">
                              {t.linkedToLabel}
                            </p>

                            <p className="mt-2 text-sm font-semibold text-yellow-400">
                              {lead.links?.title || lead.link_title || t.noLinkedLink}
                            </p>

                            <p className="mt-2 break-all text-sm text-zinc-400">
                              {t.destinationLabel}:{" "}
                              {lead.links?.url || lead.link_url || "—"}
                            </p>

                            <p className="mt-2 break-all text-sm text-green-400">
                              {t.trackedLinkLabel}: {trackedUrl || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 lg:w-64">
                          <select
                            value={lead.status || "new"}
                            onChange={(e) =>
                              updateLeadStatus(lead.id, e.target.value as LeadStatus)
                            }
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {t.statusLabels[option]}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => deleteLead(lead.id)}
                            className="rounded-xl border border-red-500/30 px-4 py-3 font-medium text-red-400"
                          >
                            {t.deleteLead}
                          </button>
                        </div>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-yellow-400">{value}</p>
    </div>
  )
}