"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Lead = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
}

type MessageThread = {
  id: string
  user_id?: string
  lead_id: string | null
  customer: string | null
  email: string | null
  subject: string | null
  last_message: string | null
  created_at: string | null
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
    newConversation: string
    newConversationDescription: string
    selectLeadPlaceholder: string
    customerNamePlaceholder: string
    customerEmailPlaceholder: string
    subjectPlaceholder: string
    lastMessagePlaceholder: string
    saveConversation: string
    inbox: string
    inboxDescription: string
    searchPlaceholder: string
    noMessages: string
    noEmail: string
    noMessagePreview: string
    savedLabel: string
    deleteMessage: string
    deleteConfirm: string
    customerRequired: string
    subjectRequired: string
    languageLabel: string
    loadingLabel: string
    saveError: string
    loadError: string
    deleteError: string
    noLeadsOption: string
  }
> = {
  English: {
    pageTitle: "Messages",
    pageDescription:
      "Organize customer conversations and keep your communication in one place.",
    newConversation: "New Conversation",
    newConversationDescription: "Save a customer message thread manually for MVP.",
    selectLeadPlaceholder: "Select a lead",
    customerNamePlaceholder: "Customer name",
    customerEmailPlaceholder: "Customer email",
    subjectPlaceholder: "Subject",
    lastMessagePlaceholder: "Last message",
    saveConversation: "Save Conversation",
    inbox: "Inbox",
    inboxDescription: "Review saved customer conversations.",
    searchPlaceholder: "Search messages...",
    noMessages: "No messages yet.",
    noEmail: "No email",
    noMessagePreview: "No message preview",
    savedLabel: "Saved",
    deleteMessage: "Delete Message",
    deleteConfirm: "Delete this conversation?",
    customerRequired: "Customer name is required.",
    subjectRequired: "Subject is required.",
    languageLabel: "Language",
    loadingLabel: "Loading messages...",
    saveError: "Failed to save conversation.",
    loadError: "Failed to load messages.",
    deleteError: "Failed to delete conversation.",
    noLeadsOption: "Choose a lead or leave blank",
  },
  French: {
    pageTitle: "Messages",
    pageDescription:
      "Organisez les conversations clients et gardez toute votre communication au même endroit.",
    newConversation: "Nouvelle conversation",
    newConversationDescription:
      "Enregistrez manuellement une conversation client pour le MVP.",
    selectLeadPlaceholder: "Sélectionnez un prospect",
    customerNamePlaceholder: "Nom du client",
    customerEmailPlaceholder: "Email du client",
    subjectPlaceholder: "Sujet",
    lastMessagePlaceholder: "Dernier message",
    saveConversation: "Enregistrer la conversation",
    inbox: "Boîte de réception",
    inboxDescription: "Consultez les conversations clients enregistrées.",
    searchPlaceholder: "Rechercher des messages...",
    noMessages: "Aucun message pour le moment.",
    noEmail: "Aucun email",
    noMessagePreview: "Aucun aperçu du message",
    savedLabel: "Enregistré",
    deleteMessage: "Supprimer le message",
    deleteConfirm: "Supprimer cette conversation ?",
    customerRequired: "Le nom du client est requis.",
    subjectRequired: "Le sujet est requis.",
    languageLabel: "Langue",
    loadingLabel: "Chargement des messages...",
    saveError: "Échec de l'enregistrement de la conversation.",
    loadError: "Échec du chargement des messages.",
    deleteError: "Échec de la suppression de la conversation.",
    noLeadsOption: "Choisissez un prospect ou laissez vide",
  },
  Spanish: {
    pageTitle: "Mensajes",
    pageDescription:
      "Organiza las conversaciones con clientes y mantén toda tu comunicación en un solo lugar.",
    newConversation: "Nueva conversación",
    newConversationDescription:
      "Guarda manualmente un hilo de mensaje del cliente para el MVP.",
    selectLeadPlaceholder: "Selecciona un prospecto",
    customerNamePlaceholder: "Nombre del cliente",
    customerEmailPlaceholder: "Correo del cliente",
    subjectPlaceholder: "Asunto",
    lastMessagePlaceholder: "Último mensaje",
    saveConversation: "Guardar conversación",
    inbox: "Bandeja de entrada",
    inboxDescription: "Revisa las conversaciones guardadas de clientes.",
    searchPlaceholder: "Buscar mensajes...",
    noMessages: "Aún no hay mensajes.",
    noEmail: "Sin correo",
    noMessagePreview: "Sin vista previa del mensaje",
    savedLabel: "Guardado",
    deleteMessage: "Eliminar mensaje",
    deleteConfirm: "¿Eliminar esta conversación?",
    customerRequired: "El nombre del cliente es obligatorio.",
    subjectRequired: "El asunto es obligatorio.",
    languageLabel: "Idioma",
    loadingLabel: "Cargando mensajes...",
    saveError: "No se pudo guardar la conversación.",
    loadError: "No se pudieron cargar los mensajes.",
    deleteError: "No se pudo eliminar la conversación.",
    noLeadsOption: "Elige un prospecto o déjalo vacío",
  },
  Portuguese: {
    pageTitle: "Mensagens",
    pageDescription:
      "Organize conversas com clientes e mantenha sua comunicação em um só lugar.",
    newConversation: "Nova conversa",
    newConversationDescription:
      "Salve manualmente uma conversa de cliente para o MVP.",
    selectLeadPlaceholder: "Selecione um lead",
    customerNamePlaceholder: "Nome do cliente",
    customerEmailPlaceholder: "Email do cliente",
    subjectPlaceholder: "Assunto",
    lastMessagePlaceholder: "Última mensagem",
    saveConversation: "Salvar conversa",
    inbox: "Caixa de entrada",
    inboxDescription: "Revise as conversas salvas dos clientes.",
    searchPlaceholder: "Pesquisar mensagens...",
    noMessages: "Ainda não há mensagens.",
    noEmail: "Sem email",
    noMessagePreview: "Sem prévia da mensagem",
    savedLabel: "Salvo",
    deleteMessage: "Excluir mensagem",
    deleteConfirm: "Excluir esta conversa?",
    customerRequired: "O nome do cliente é obrigatório.",
    subjectRequired: "O assunto é obrigatório.",
    languageLabel: "Idioma",
    loadingLabel: "Carregando mensagens...",
    saveError: "Falha ao salvar conversa.",
    loadError: "Falha ao carregar mensagens.",
    deleteError: "Falha ao excluir conversa.",
    noLeadsOption: "Escolha um lead ou deixe vazio",
  },
  Arabic: {
    pageTitle: "الرسائل",
    pageDescription: "نظّم محادثات العملاء واحتفظ بكل تواصلك في مكان واحد.",
    newConversation: "محادثة جديدة",
    newConversationDescription: "احفظ محادثة عميل يدويًا لنسخة MVP.",
    selectLeadPlaceholder: "اختر عميلاً محتملاً",
    customerNamePlaceholder: "اسم العميل",
    customerEmailPlaceholder: "بريد العميل",
    subjectPlaceholder: "الموضوع",
    lastMessagePlaceholder: "آخر رسالة",
    saveConversation: "حفظ المحادثة",
    inbox: "الوارد",
    inboxDescription: "راجع محادثات العملاء المحفوظة.",
    searchPlaceholder: "ابحث في الرسائل...",
    noMessages: "لا توجد رسائل بعد.",
    noEmail: "لا يوجد بريد",
    noMessagePreview: "لا توجد معاينة للرسالة",
    savedLabel: "تم الحفظ",
    deleteMessage: "حذف الرسالة",
    deleteConfirm: "هل تريد حذف هذه المحادثة؟",
    customerRequired: "اسم العميل مطلوب.",
    subjectRequired: "الموضوع مطلوب.",
    languageLabel: "اللغة",
    loadingLabel: "جارٍ تحميل الرسائل...",
    saveError: "فشل حفظ المحادثة.",
    loadError: "فشل تحميل الرسائل.",
    deleteError: "فشل حذف المحادثة.",
    noLeadsOption: "اختر عميلاً محتملاً أو اتركه فارغًا",
  },
  Hindi: {
    pageTitle: "मैसेज",
    pageDescription:
      "कस्टमर बातचीत को व्यवस्थित करें और अपनी कम्युनिकेशन एक ही जगह रखें।",
    newConversation: "नई बातचीत",
    newConversationDescription:
      "MVP के लिए कस्टमर मैसेज थ्रेड को मैन्युअली सेव करें।",
    selectLeadPlaceholder: "एक lead चुनें",
    customerNamePlaceholder: "कस्टमर का नाम",
    customerEmailPlaceholder: "कस्टमर का ईमेल",
    subjectPlaceholder: "विषय",
    lastMessagePlaceholder: "आखिरी मैसेज",
    saveConversation: "बातचीत सेव करें",
    inbox: "इनबॉक्स",
    inboxDescription: "सेव की गई कस्टमर बातचीत देखें।",
    searchPlaceholder: "मैसेज खोजें...",
    noMessages: "अभी तक कोई मैसेज नहीं है।",
    noEmail: "कोई ईमेल नहीं",
    noMessagePreview: "मैसेज प्रीव्यू नहीं है",
    savedLabel: "सेव किया गया",
    deleteMessage: "मैसेज हटाएं",
    deleteConfirm: "क्या इस बातचीत को हटाना है?",
    customerRequired: "कस्टमर का नाम जरूरी है।",
    subjectRequired: "विषय जरूरी है।",
    languageLabel: "भाषा",
    loadingLabel: "मैसेज लोड हो रहे हैं...",
    saveError: "बातचीत सेव नहीं हो सकी।",
    loadError: "मैसेज लोड नहीं हो सके।",
    deleteError: "बातचीत हटाई नहीं जा सकी।",
    noLeadsOption: "एक lead चुनें या खाली छोड़ें",
  },
  Creole: {
    pageTitle: "Mesaj",
    pageDescription:
      "Òganize konvèsasyon kliyan yo epi kenbe tout kominikasyon ou nan yon sèl plas.",
    newConversation: "Nouvo konvèsasyon",
    newConversationDescription:
      "Sove yon fil mesaj kliyan manyèlman pou MVP a.",
    selectLeadPlaceholder: "Chwazi yon lead",
    customerNamePlaceholder: "Non kliyan an",
    customerEmailPlaceholder: "Imèl kliyan an",
    subjectPlaceholder: "Sijè",
    lastMessagePlaceholder: "Dènye mesaj",
    saveConversation: "Sove konvèsasyon an",
    inbox: "Bwat resepsyon",
    inboxDescription: "Revize konvèsasyon kliyan ki sove yo.",
    searchPlaceholder: "Chèche mesaj...",
    noMessages: "Poko gen mesaj.",
    noEmail: "Pa gen imèl",
    noMessagePreview: "Pa gen preview mesaj",
    savedLabel: "Sove",
    deleteMessage: "Efase mesaj",
    deleteConfirm: "Efase konvèsasyon sa a?",
    customerRequired: "Non kliyan an obligatwa.",
    subjectRequired: "Sijè a obligatwa.",
    languageLabel: "Lang",
    loadingLabel: "Ap chaje mesaj yo...",
    saveError: "Pa t ka sove konvèsasyon an.",
    loadError: "Pa t ka chaje mesaj yo.",
    deleteError: "Pa t ka efase konvèsasyon an.",
    noLeadsOption: "Chwazi yon lead oswa kite l vid",
  },
}

export default function MessagesPage() {
  const supabase = createClient()

  const [threads, setThreads] = useState<MessageThread[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState("")
  const [search, setSearch] = useState("")
  const [customer, setCustomer] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [lastMessage, setLastMessage] = useState("")
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

  async function loadLeads() {
    const user = await getCurrentUser()
    if (!user) {
      setLeads([])
      return
    }

    const { data, error } = await supabase
      .from("leads")
      .select("id, name, email, phone")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Load leads for messages error:", error.message, error.details, error.hint)
      return
    }

    setLeads((data as Lead[]) || [])
  }

  async function loadThreads() {
    setLoading(true)

    const user = await getCurrentUser()

    if (!user) {
      setThreads([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("messages")
      .select("id, user_id, lead_id, customer, email, subject, last_message, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Load messages error:", error.message, error.details, error.hint)
      alert(`${t.loadError} ${error.message}`)
      setLoading(false)
      return
    }

    setThreads((data as MessageThread[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      await Promise.all([loadLeads(), loadThreads()])
    }
    init()
  }, [])

  function handleLeadChange(leadId: string) {
    setSelectedLeadId(leadId)

    const lead = leads.find((item) => item.id === leadId)

    if (!lead) {
      setCustomer("")
      setEmail("")
      return
    }

    setCustomer(lead.name || "")
    setEmail(lead.email || "")
  }

  async function addThread(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!customer.trim()) {
      alert(t.customerRequired)
      return
    }

    if (!subject.trim()) {
      alert(t.subjectRequired)
      return
    }

    const user = await getCurrentUser()
    if (!user) return

    try {
      setSaving(true)

      let leadId = selectedLeadId

      if (!leadId) {
        const leadPayload = {
          user_id: user.id,
          name: customer.trim(),
          email: email.trim() || null,
          phone: null,
          source: "message",
          notes: `Created from message: ${subject.trim()}`,
          status: "new",
          created_at: new Date().toISOString(),
        }

        const { data: newLead, error: leadError } = await supabase
          .from("leads")
          .insert([leadPayload])
          .select("id")
          .single()

        if (leadError) {
          console.error(
            "Create lead from message error:",
            leadError.message,
            leadError.details,
            leadError.hint
          )
          alert(`Failed to create lead. ${leadError.message}`)
          return
        }

        leadId = newLead.id
      }

      const payload = {
        user_id: user.id,
        lead_id: leadId,
        customer: customer.trim(),
        email: email.trim() || null,
        subject: subject.trim(),
        last_message: lastMessage.trim() || null,
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("messages").insert([payload])

      if (error) {
        console.error("Add message error:", error.message, error.details, error.hint)
        alert(`${t.saveError} ${error.message}`)
        return
      }

      setSelectedLeadId("")
      setCustomer("")
      setEmail("")
      setSubject("")
      setLastMessage("")

      await Promise.all([loadLeads(), loadThreads()])
    } finally {
      setSaving(false)
    }
  }

  async function deleteThread(id: string) {
    const confirmed = window.confirm(t.deleteConfirm)
    if (!confirmed) return

    const user = await getCurrentUser()
    if (!user) return

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Delete message error:", error.message, error.details, error.hint)
      alert(`${t.deleteError} ${error.message}`)
      return
    }

    await loadThreads()
  }

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return threads

    return threads.filter((thread) =>
      [
        thread.customer || "",
        thread.email || "",
        thread.subject || "",
        thread.last_message || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [threads, search])

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

        <section className="grid gap-8 xl:grid-cols-[1fr_1.4fr]">
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold text-yellow-400">
              {t.newConversation}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              {t.newConversationDescription}
            </p>

            <form onSubmit={addThread} className="mt-6 space-y-4">
              <select
                value={selectedLeadId}
                onChange={(e) => handleLeadChange(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
              >
                <option value="">{t.noLeadsOption}</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name || "Unnamed Lead"} {lead.email ? `• ${lead.email}` : ""}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder={t.customerNamePlaceholder}
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                required
              />

              <input
                type="email"
                placeholder={t.customerEmailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
              />

              <input
                type="text"
                placeholder={t.subjectPlaceholder}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
                required
              />

              <textarea
                placeholder={t.lastMessagePlaceholder}
                value={lastMessage}
                onChange={(e) => setLastMessage(e.target.value)}
                className="min-h-[150px] w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-white outline-none"
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black disabled:opacity-50"
              >
                {saving ? "Saving..." : t.saveConversation}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">{t.inbox}</h2>
                <p className="mt-2 text-sm text-zinc-400">{t.inboxDescription}</p>
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
              ) : filteredThreads.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-black/20 p-6 text-zinc-500">
                  {t.noMessages}
                </div>
              ) : (
                filteredThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className="rounded-2xl border border-zinc-800 bg-black/20 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-white">
                          {thread.customer || "Unknown Customer"}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          {thread.email || t.noEmail}
                        </p>
                        <p className="text-sm font-medium text-yellow-400">
                          {thread.subject || "No subject"}
                        </p>
                        <p className="text-sm text-zinc-400">
                          {thread.last_message || t.noMessagePreview}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {t.savedLabel}:{" "}
                          {thread.created_at
                            ? new Date(thread.created_at).toLocaleString()
                            : "—"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteThread(thread.id)}
                        className="rounded-xl border border-red-500/30 px-4 py-3 font-medium text-red-400"
                      >
                        {t.deleteMessage}
                      </button>
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