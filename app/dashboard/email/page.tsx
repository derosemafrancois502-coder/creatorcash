"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type EmailStatus = "draft" | "sent" | "scheduled"

type EmailItem = {
  id: string
  customer: string | null
  email: string | null
  subject: string | null
  body: string | null
  status: EmailStatus | null
  created_at: string | null
  user_id?: string | null
}

const STATUS_OPTIONS: EmailStatus[] = ["draft", "sent", "scheduled"]

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
    totalEmails: string
    draftLabel: string
    sentLabel: string
    scheduledLabel: string
    createEmail: string
    createEmailDescription: string
    customerNamePlaceholder: string
    customerEmailPlaceholder: string
    subjectPlaceholder: string
    bodyPlaceholder: string
    saveEmailButton: string
    emailLibrary: string
    emailLibraryDescription: string
    searchPlaceholder: string
    noEmails: string
    noEmail: string
    noBody: string
    savedLabel: string
    statusLabel: string
    deleteEmail: string
    deleteConfirm: string
    customerRequired: string
    subjectRequired: string
    languageLabel: string
    loadingLabel: string
    saveError: string
    loadError: string
    deleteError: string
    updateError: string
    authError: string
    copyEmails: string
    statusLabels: Record<EmailStatus, string>
  }
> = {
  English: {
    pageTitle: "Email",
    pageDescription:
      "Create, store, and manage email drafts and communication inside CreatorGoat.",
    totalEmails: "Total Emails",
    draftLabel: "Draft",
    sentLabel: "Sent",
    scheduledLabel: "Scheduled",
    createEmail: "Create Email",
    createEmailDescription: "Save an email entry for your MVP workflow.",
    customerNamePlaceholder: "Customer name",
    customerEmailPlaceholder: "Customer email",
    subjectPlaceholder: "Subject",
    bodyPlaceholder: "Email body",
    saveEmailButton: "Save Email",
    emailLibrary: "Email Library",
    emailLibraryDescription: "Review saved emails and update their status.",
    searchPlaceholder: "Search emails...",
    noEmails: "No emails yet.",
    noEmail: "No email",
    noBody: "No email body",
    savedLabel: "Saved",
    statusLabel: "Status",
    deleteEmail: "Delete Email",
    deleteConfirm: "Delete this email?",
    customerRequired: "Customer name is required.",
    subjectRequired: "Subject is required.",
    languageLabel: "Language",
    loadingLabel: "Loading emails...",
    saveError: "Failed to save email.",
    loadError: "Failed to load emails.",
    deleteError: "Failed to delete email.",
    updateError: "Failed to update email status.",
    authError: "You must be logged in.",
    copyEmails: "Copy Email",
    statusLabels: {
      draft: "DRAFT",
      sent: "SENT",
      scheduled: "SCHEDULED",
    },
  },
  French: {
    pageTitle: "Email",
    pageDescription:
      "Créez, stockez et gérez vos emails et brouillons dans CreatorGoat.",
    totalEmails: "Total emails",
    draftLabel: "Brouillon",
    sentLabel: "Envoyé",
    scheduledLabel: "Planifié",
    createEmail: "Créer un email",
    createEmailDescription: "Enregistrez un email pour votre workflow MVP.",
    customerNamePlaceholder: "Nom du client",
    customerEmailPlaceholder: "Email du client",
    subjectPlaceholder: "Sujet",
    bodyPlaceholder: "Corps de l'email",
    saveEmailButton: "Enregistrer l'email",
    emailLibrary: "Bibliothèque d'emails",
    emailLibraryDescription:
      "Consultez les emails enregistrés et mettez à jour leur statut.",
    searchPlaceholder: "Rechercher des emails...",
    noEmails: "Aucun email pour le moment.",
    noEmail: "Aucun email",
    noBody: "Aucun contenu",
    savedLabel: "Enregistré",
    statusLabel: "Statut",
    deleteEmail: "Supprimer l'email",
    deleteConfirm: "Supprimer cet email ?",
    customerRequired: "Le nom du client est requis.",
    subjectRequired: "Le sujet est requis.",
    languageLabel: "Langue",
    loadingLabel: "Chargement des emails...",
    saveError: "Échec de l'enregistrement de l'email.",
    loadError: "Échec du chargement des emails.",
    deleteError: "Échec de la suppression de l'email.",
    updateError: "Échec de la mise à jour du statut.",
    authError: "Vous devez être connecté.",
    copyEmails: "Copier l'email",
    statusLabels: {
      draft: "BROUILLON",
      sent: "ENVOYÉ",
      scheduled: "PLANIFIÉ",
    },
  },
  Spanish: {
    pageTitle: "Email",
    pageDescription:
      "Crea, guarda y administra emails dentro de CreatorGoat.",
    totalEmails: "Emails totales",
    draftLabel: "Borrador",
    sentLabel: "Enviado",
    scheduledLabel: "Programado",
    createEmail: "Crear email",
    createEmailDescription: "Guarda un email para tu flujo MVP.",
    customerNamePlaceholder: "Nombre del cliente",
    customerEmailPlaceholder: "Correo del cliente",
    subjectPlaceholder: "Asunto",
    bodyPlaceholder: "Cuerpo del email",
    saveEmailButton: "Guardar email",
    emailLibrary: "Biblioteca de emails",
    emailLibraryDescription: "Revisa emails guardados y actualiza su estado.",
    searchPlaceholder: "Buscar emails...",
    noEmails: "Aún no hay emails.",
    noEmail: "Sin email",
    noBody: "Sin contenido",
    savedLabel: "Guardado",
    statusLabel: "Estado",
    deleteEmail: "Eliminar email",
    deleteConfirm: "¿Eliminar este email?",
    customerRequired: "El nombre del cliente es obligatorio.",
    subjectRequired: "El asunto es obligatorio.",
    languageLabel: "Idioma",
    loadingLabel: "Cargando emails...",
    saveError: "No se pudo guardar el email.",
    loadError: "No se pudieron cargar los emails.",
    deleteError: "No se pudo eliminar el email.",
    updateError: "No se pudo actualizar el estado.",
    authError: "Debes iniciar sesión.",
    copyEmails: "Copiar email",
    statusLabels: {
      draft: "BORRADOR",
      sent: "ENVIADO",
      scheduled: "PROGRAMADO",
    },
  },
  Portuguese: {
    pageTitle: "Email",
    pageDescription:
      "Crie, salve e gerencie emails dentro do CreatorGoat.",
    totalEmails: "Total de emails",
    draftLabel: "Rascunho",
    sentLabel: "Enviado",
    scheduledLabel: "Agendado",
    createEmail: "Criar email",
    createEmailDescription: "Salve um email para seu fluxo MVP.",
    customerNamePlaceholder: "Nome do cliente",
    customerEmailPlaceholder: "Email do cliente",
    subjectPlaceholder: "Assunto",
    bodyPlaceholder: "Corpo do email",
    saveEmailButton: "Salvar email",
    emailLibrary: "Biblioteca de emails",
    emailLibraryDescription: "Revise emails salvos e atualize o status.",
    searchPlaceholder: "Pesquisar emails...",
    noEmails: "Ainda não há emails.",
    noEmail: "Sem email",
    noBody: "Sem conteúdo",
    savedLabel: "Salvo",
    statusLabel: "Status",
    deleteEmail: "Excluir email",
    deleteConfirm: "Excluir este email?",
    customerRequired: "O nome do cliente é obrigatório.",
    subjectRequired: "O assunto é obrigatório.",
    languageLabel: "Idioma",
    loadingLabel: "Carregando emails...",
    saveError: "Falha ao salvar email.",
    loadError: "Falha ao carregar emails.",
    deleteError: "Falha ao excluir email.",
    updateError: "Falha ao atualizar status.",
    authError: "Você precisa estar conectado.",
    copyEmails: "Copiar email",
    statusLabels: {
      draft: "RASCUNHO",
      sent: "ENVIADO",
      scheduled: "AGENDADO",
    },
  },
  Arabic: {
    pageTitle: "البريد الإلكتروني",
    pageDescription:
      "أنشئ واحفظ وأدر رسائل البريد الإلكتروني داخل CreatorGoat.",
    totalEmails: "إجمالي الرسائل",
    draftLabel: "مسودة",
    sentLabel: "مرسل",
    scheduledLabel: "مجدول",
    createEmail: "إنشاء بريد",
    createEmailDescription: "احفظ إدخال بريد لمرحلة MVP.",
    customerNamePlaceholder: "اسم العميل",
    customerEmailPlaceholder: "بريد العميل",
    subjectPlaceholder: "الموضوع",
    bodyPlaceholder: "محتوى البريد",
    saveEmailButton: "حفظ البريد",
    emailLibrary: "مكتبة البريد",
    emailLibraryDescription: "راجع رسائل البريد المحفوظة وحدّث حالتها.",
    searchPlaceholder: "ابحث في الرسائل...",
    noEmails: "لا توجد رسائل بعد.",
    noEmail: "لا يوجد بريد",
    noBody: "لا يوجد محتوى",
    savedLabel: "تم الحفظ",
    statusLabel: "الحالة",
    deleteEmail: "حذف البريد",
    deleteConfirm: "هل تريد حذف هذا البريد؟",
    customerRequired: "اسم العميل مطلوب.",
    subjectRequired: "الموضوع مطلوب.",
    languageLabel: "اللغة",
    loadingLabel: "جارٍ تحميل الرسائل...",
    saveError: "فشل حفظ البريد.",
    loadError: "فشل تحميل الرسائل.",
    deleteError: "فشل حذف البريد.",
    updateError: "فشل تحديث الحالة.",
    authError: "يجب تسجيل الدخول.",
    copyEmails: "نسخ البريد",
    statusLabels: {
      draft: "مسودة",
      sent: "مرسل",
      scheduled: "مجدول",
    },
  },
  Hindi: {
    pageTitle: "ईमेल",
    pageDescription:
      "CreatorGoat के अंदर ईमेल बनाएं, सेव करें और मैनेज करें।",
    totalEmails: "कुल ईमेल",
    draftLabel: "ड्राफ्ट",
    sentLabel: "भेजा गया",
    scheduledLabel: "शेड्यूल्ड",
    createEmail: "ईमेल बनाएं",
    createEmailDescription: "अपने MVP workflow के लिए ईमेल सेव करें।",
    customerNamePlaceholder: "कस्टमर का नाम",
    customerEmailPlaceholder: "कस्टमर का ईमेल",
    subjectPlaceholder: "विषय",
    bodyPlaceholder: "ईमेल बॉडी",
    saveEmailButton: "ईमेल सेव करें",
    emailLibrary: "ईमेल लाइब्रेरी",
    emailLibraryDescription: "सेव किए गए ईमेल देखें और उनका स्टेटस अपडेट करें।",
    searchPlaceholder: "ईमेल खोजें...",
    noEmails: "अभी तक कोई ईमेल नहीं है।",
    noEmail: "कोई ईमेल नहीं",
    noBody: "कोई कंटेंट नहीं",
    savedLabel: "सेव किया गया",
    statusLabel: "स्टेटस",
    deleteEmail: "ईमेल हटाएं",
    deleteConfirm: "क्या इस ईमेल को हटाना है?",
    customerRequired: "कस्टमर का नाम जरूरी है।",
    subjectRequired: "विषय जरूरी है।",
    languageLabel: "भाषा",
    loadingLabel: "ईमेल लोड हो रहे हैं...",
    saveError: "ईमेल सेव नहीं हो सका।",
    loadError: "ईमेल लोड नहीं हो सके।",
    deleteError: "ईमेल हटाया नहीं जा सका।",
    updateError: "स्टेटस अपडेट नहीं हो सका।",
    authError: "आपको लॉग इन होना होगा।",
    copyEmails: "ईमेल कॉपी करें",
    statusLabels: {
      draft: "ड्राफ्ट",
      sent: "भेजा गया",
      scheduled: "शेड्यूल्ड",
    },
  },
  Creole: {
    pageTitle: "Imèl",
    pageDescription:
      "Kreye, sove, epi jere imèl yo andedan CreatorGoat.",
    totalEmails: "Total imèl",
    draftLabel: "Bouyon",
    sentLabel: "Voye",
    scheduledLabel: "Pwograme",
    createEmail: "Kreye imèl",
    createEmailDescription: "Sove yon imèl pou workflow MVP ou a.",
    customerNamePlaceholder: "Non kliyan an",
    customerEmailPlaceholder: "Imèl kliyan an",
    subjectPlaceholder: "Sijè",
    bodyPlaceholder: "Kontni imèl la",
    saveEmailButton: "Sove imèl la",
    emailLibrary: "Bibliyotèk imèl",
    emailLibraryDescription: "Revize imèl ki sove yo epi mete estati yo ajou.",
    searchPlaceholder: "Chèche imèl...",
    noEmails: "Poko gen imèl.",
    noEmail: "Pa gen imèl",
    noBody: "Pa gen kontni",
    savedLabel: "Sove",
    statusLabel: "Estati",
    deleteEmail: "Efase imèl",
    deleteConfirm: "Efase imèl sa a?",
    customerRequired: "Non kliyan an obligatwa.",
    subjectRequired: "Sijè a obligatwa.",
    languageLabel: "Lang",
    loadingLabel: "Ap chaje imèl yo...",
    saveError: "Pa t ka sove imèl la.",
    loadError: "Pa t ka chaje imèl yo.",
    deleteError: "Pa t ka efase imèl la.",
    updateError: "Pa t ka mete estati a ajou.",
    authError: "Ou dwe konekte.",
    copyEmails: "Kopye imèl la",
    statusLabels: {
      draft: "BOUYON",
      sent: "VOYE",
      scheduled: "PWOGRAME",
    },
  },
}

function MailCoreVisual() {
  return (
    <div className="relative flex h-[340px] w-full items-center justify-center overflow-hidden rounded-[32px] border border-yellow-500/20 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.08),transparent_48%),linear-gradient(180deg,rgba(10,10,10,0.98),rgba(18,18,18,0.98))]">
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="absolute h-[250px] w-[250px] rounded-full border border-yellow-500/15 animate-spin [animation-duration:18s]" />
      <div className="absolute h-[180px] w-[180px] rounded-full border border-yellow-300/20 animate-spin [animation-direction:reverse] [animation-duration:12s]" />

      <div className="absolute left-[10%] top-[18%] rounded-full border border-yellow-400/20 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-200/90 rotate-[-8deg] shadow-[0_0_30px_rgba(250,204,21,0.12)]">
        deliver
      </div>
      <div className="absolute right-[10%] top-[24%] rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-200/90 rotate-[8deg] shadow-[0_0_30px_rgba(250,204,21,0.12)]">
        campaign
      </div>
      <div className="absolute left-[12%] bottom-[20%] rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs text-orange-200/90 rotate-[6deg] shadow-[0_0_30px_rgba(250,204,21,0.12)]">
        inbox
      </div>
      <div className="absolute right-[12%] bottom-[18%] rounded-full border border-yellow-300/20 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-200/90 rotate-[-6deg] shadow-[0_0_30px_rgba(250,204,21,0.12)]">
        convert
      </div>

      <div className="relative flex h-36 w-44 items-center justify-center rounded-[28px] border border-yellow-300/30 bg-[linear-gradient(180deg,rgba(32,32,32,0.98),rgba(12,12,12,0.98))] shadow-[0_0_60px_rgba(250,204,21,0.24)]">
        <div className="absolute inset-3 rounded-[22px] border border-yellow-500/10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,240,180,0.16),transparent_50%)]" />
        <div className="relative text-center">
          <p className="text-5xl">📧</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-yellow-300">
            Mail Core
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-4 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
            Email Intelligence Core
          </p>
          <p className="mt-2 text-sm text-zinc-300">
            Premium mail engine for customer communication, draft control, and better email flow.
          </p>
        </div>
      </div>
    </div>
  )
}

function HeroStatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-yellow-400">{value}</p>
    </div>
  )
}

export default function EmailPage() {
  const supabase = useMemo(() => createClient(), [])

  const [emails, setEmails] = useState<EmailItem[]>([])
  const [search, setSearch] = useState("")
  const [customer, setCustomer] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [status, setStatus] = useState<EmailStatus>("draft")
  const [language, setLanguage] = useState<Language>("English")
  const [loading, setLoading] = useState(true)

  const t = translations[language]

  async function getCurrentUserId() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.user?.id || null
  }

  async function loadEmails() {
    setLoading(true)

    const userId = await getCurrentUserId()

    if (!userId) {
      alert(t.authError)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("emails")
      .select("id, customer, email, subject, body, status, created_at, user_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Load emails error:", error.message, error.details, error.hint)
      alert(`${t.loadError} ${error.message}`)
      setLoading(false)
      return
    }

    setEmails((data as EmailItem[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    loadEmails()
  }, [])

  async function addEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!customer.trim()) {
      alert(t.customerRequired)
      return
    }

    if (!subject.trim()) {
      alert(t.subjectRequired)
      return
    }

    const userId = await getCurrentUserId()

    if (!userId) {
      alert(t.authError)
      return
    }

    const payload = {
      customer: customer.trim(),
      email: email.trim() || null,
      subject: subject.trim(),
      body: body.trim() || null,
      status,
      created_at: new Date().toISOString(),
      user_id: userId,
    }

    const { error } = await supabase.from("emails").insert([payload])

    if (error) {
      console.error("Add email error:", error.message, error.details, error.hint)
      alert(`${t.saveError} ${error.message}`)
      return
    }

    setCustomer("")
    setEmail("")
    setSubject("")
    setBody("")
    setStatus("draft")

    await loadEmails()
  }

  async function deleteEmail(id: string) {
    const confirmed = window.confirm(t.deleteConfirm)
    if (!confirmed) return

    const userId = await getCurrentUserId()

    if (!userId) {
      alert(t.authError)
      return
    }

    const { error } = await supabase
      .from("emails")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      console.error("Delete email error:", error.message, error.details, error.hint)
      alert(`${t.deleteError} ${error.message}`)
      return
    }

    await loadEmails()
  }

  async function updateEmailStatus(id: string, nextStatus: EmailStatus) {
    const userId = await getCurrentUserId()

    if (!userId) {
      alert(t.authError)
      return
    }

    const { error } = await supabase
      .from("emails")
      .update({ status: nextStatus })
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      console.error("Update email status error:", error.message, error.details, error.hint)
      alert(`${t.updateError} ${error.message}`)
      return
    }

    await loadEmails()
  }

  const filteredEmails = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return emails

    return emails.filter((item) =>
      [
        item.customer || "",
        item.email || "",
        item.subject || "",
        item.body || "",
        item.status || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [emails, search])

  const stats = useMemo(() => {
    return {
      total: emails.length,
      draft: emails.filter((item) => item.status === "draft").length,
      sent: emails.filter((item) => item.status === "sent").length,
      scheduled: emails.filter((item) => item.status === "scheduled").length,
    }
  }, [emails])

  return (
    <div className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[32px] border border-yellow-500/20 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.14),transparent_28%),linear-gradient(180deg,rgba(24,24,24,0.98),rgba(10,10,10,0.98))] p-8">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">
                CreatorGoat Email Engine
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-yellow-400 sm:text-5xl">
                {t.pageTitle}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                {t.pageDescription}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-4">
                <HeroStatCard label={t.totalEmails} value={stats.total} />
                <HeroStatCard label={t.draftLabel} value={stats.draft} />
                <HeroStatCard label={t.sentLabel} value={stats.sent} />
                <HeroStatCard label={t.scheduledLabel} value={stats.scheduled} />
              </div>
            </div>

            <MailCoreVisual />
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[30px] border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.05)]">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
                  Input Engine
                </p>
                <h2 className="mt-2 text-2xl font-bold text-yellow-400">
                  {t.createEmail}
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  {t.createEmailDescription}
                </p>
              </div>

              <div className="w-full sm:max-w-xs">
                <label className="mb-2 block text-sm text-zinc-400">
                  {t.languageLabel}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      🌍 {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={addEmail} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">Customer</label>
                <input
                  type="text"
                  placeholder={t.customerNamePlaceholder}
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Email</label>
                <input
                  type="email"
                  placeholder={t.customerEmailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Subject</label>
                <input
                  type="text"
                  placeholder={t.subjectPlaceholder}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">{t.statusLabel}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EmailStatus)}
                  className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {t.statusLabels[option]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">Body</label>
                <textarea
                  placeholder={t.bodyPlaceholder}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[170px] w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                />
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-4 text-sm text-zinc-300">
                This module is built for draft management, customer emails, scheduled communication, and premium email flow inside CreatorGoat.
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:opacity-90"
              >
                {t.saveEmailButton}
              </button>
            </form>
          </div>

          <div className="rounded-[30px] border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.05)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/70">
                  Output Library
                </p>
                <h2 className="mt-2 text-2xl font-bold text-yellow-400">
                  {t.emailLibrary}
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  {t.emailLibraryDescription}
                </p>
              </div>

              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400 sm:max-w-xs"
              />
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="rounded-2xl border border-zinc-800 bg-black/20 p-6 text-zinc-500">
                  {t.loadingLabel}
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-black/20 p-6 text-zinc-500">
                  {t.noEmails}
                </div>
              ) : (
                filteredEmails.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-zinc-800 bg-black/20 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        <h3 className="text-xl font-semibold text-white">
                          {item.customer || "Unknown Customer"}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          {item.email || t.noEmail}
                        </p>
                        <p className="text-sm font-medium text-yellow-400">
                          {item.subject || "No subject"}
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-zinc-400">
                          {item.body || t.noBody}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {t.savedLabel}:{" "}
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString()
                            : "—"}
                        </p>
                      </div>

                      <div className="flex w-full flex-col gap-3 lg:w-64">
                        <select
                          value={item.status || "draft"}
                          onChange={(e) =>
                            updateEmailStatus(item.id, e.target.value as EmailStatus)
                          }
                          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {t.statusLabels[option]}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              `${item.subject || ""}\n\n${item.body || ""}`.trim()
                            )
                          }
                          className="rounded-2xl border border-yellow-500/30 px-4 py-3 font-medium text-yellow-300"
                        >
                          {t.copyEmails}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteEmail(item.id)}
                          className="rounded-2xl border border-red-500/30 px-4 py-3 font-medium text-red-400"
                        >
                          {t.deleteEmail}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}