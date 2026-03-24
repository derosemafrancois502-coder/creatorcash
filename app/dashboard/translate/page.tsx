"use client"

import { useMemo, useState } from "react"

const languages = [
  "Afrikaans",
  "Albanian",
  "Amharic",
  "Arabic",
  "Armenian",
  "Azerbaijani",
  "Basque",
  "Belarusian",
  "Bengali",
  "Bosnian",
  "Bulgarian",
  "Burmese",
  "Catalan",
  "Cebuano",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Corsican",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Esperanto",
  "Estonian",
  "Finnish",
  "French",
  "Frisian",
  "Galician",
  "Georgian",
  "German",
  "Greek",
  "Gujarati",
  "Haitian Creole",
  "Hausa",
  "Hawaiian",
  "Hebrew",
  "Hindi",
  "Hmong",
  "Hungarian",
  "Icelandic",
  "Igbo",
  "Indonesian",
  "Irish",
  "Italian",
  "Japanese",
  "Javanese",
  "Kannada",
  "Kazakh",
  "Khmer",
  "Kinyarwanda",
  "Korean",
  "Kurdish",
  "Kyrgyz",
  "Lao",
  "Latin",
  "Latvian",
  "Lithuanian",
  "Luxembourgish",
  "Macedonian",
  "Malagasy",
  "Malay",
  "Malayalam",
  "Maltese",
  "Maori",
  "Marathi",
  "Mongolian",
  "Nepali",
  "Norwegian",
  "Nyanja",
  "Odia",
  "Pashto",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Samoan",
  "Scots Gaelic",
  "Serbian",
  "Sesotho",
  "Shona",
  "Sindhi",
  "Sinhala",
  "Slovak",
  "Slovenian",
  "Somali",
  "Spanish",
  "Sundanese",
  "Swahili",
  "Swedish",
  "Tagalog",
  "Tajik",
  "Tamil",
  "Tatar",
  "Telugu",
  "Thai",
  "Turkish",
  "Turkmen",
  "Ukrainian",
  "Urdu",
  "Uyghur",
  "Uzbek",
  "Vietnamese",
  "Welsh",
  "Xhosa",
  "Yiddish",
  "Yoruba",
  "Zulu",
] as const

type Language = (typeof languages)[number]

type GlobeVisualProps = {
  sourceLanguage: Language
  targetLanguage: Language
}

const flagItems = [
  "🇺🇸",
  "🇫🇷",
  "🇪🇸",
  "🇩🇪",
  "🇧🇷",
  "🇭🇹",
  "🇨🇳",
  "🇯🇵",
  "🇰🇷",
  "🇮🇹",
  "🇬🇧",
  "🇨🇦",
  "🇳🇬",
  "🇮🇳",
  "🇲🇽",
  "🇦🇪",
  "🇹🇷",
  "🇿🇦",
  "🇦🇷",
  "🇨🇴",
  "🇸🇦",
  "🇵🇹",
  "🇳🇱",
  "🇸🇪",
  "🇨🇭",
  "🇧🇪",
  "🇦🇺",
  "🇳🇿",
  "🇪🇬",
  "🇲🇦",
  "🇰🇪",
  "🇬🇭",
]

function LanguageChip({
  label,
  className,
}: {
  label: string
  className: string
}) {
  return (
    <div
      className={`absolute rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md ${className}`}
    >
      {label}
    </div>
  )
}

function OrbitFlags({
  radiusClass,
  sizeClass,
  duration,
  flags,
  reverse = false,
}: {
  radiusClass: string
  sizeClass: string
  duration: number
  flags: string[]
  reverse?: boolean
}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        animation: `${reverse ? "spin-reverse" : "spin"} ${duration}s linear infinite`,
      }}
    >
      <div className={`relative ${radiusClass}`}>
        {flags.map((flag, index) => {
          const angle = (360 / flags.length) * index

          return (
            <div
              key={`${flag}-${index}`}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `rotate(${angle}deg) translateY(-50%)`,
              }}
            >
              <div
                className={`${sizeClass} flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 shadow-[0_0_28px_rgba(255,255,255,0.10)] backdrop-blur-md`}
                style={{
                  transform: `translate(-50%, -50%) rotate(${-angle}deg)`,
                }}
              >
                <span className="drop-shadow-[0_0_12px_rgba(255,255,255,0.28)]">
                  {flag}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GlobeVisual({ sourceLanguage, targetLanguage }: GlobeVisualProps) {
  return (
    <div className="relative mx-auto flex w-full max-w-[900px] items-center justify-center py-12 lg:py-20">
      <style jsx>{`
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
      `}</style>

      <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/10 blur-3xl lg:h-[820px] lg:w-[820px]" />
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-3xl lg:h-[700px] lg:w-[700px]" />
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl lg:h-[560px] lg:w-[560px]" />

      <div className="relative flex h-[500px] w-[500px] items-center justify-center sm:h-[620px] sm:w-[620px] lg:h-[760px] lg:w-[760px]">
        <OrbitFlags
          radiusClass="h-[122%] w-[122%]"
          sizeClass="h-12 w-12 text-2xl lg:h-14 lg:w-14 lg:text-[28px]"
          duration={52}
          flags={flagItems.slice(0, 12)}
        />

        <OrbitFlags
          radiusClass="h-[104%] w-[104%]"
          sizeClass="h-11 w-11 text-xl lg:h-[52px] lg:w-[52px] lg:text-[24px]"
          duration={36}
          flags={flagItems.slice(12, 22)}
          reverse
        />

        <OrbitFlags
          radiusClass="h-[88%] w-[88%]"
          sizeClass="h-10 w-10 text-lg lg:h-12 lg:w-12 lg:text-[22px]"
          duration={24}
          flags={flagItems.slice(22, 32)}
        />

        <div className="absolute h-[122%] w-[122%] animate-[spin_60s_linear_infinite] rounded-full border border-yellow-500/10" />
        <div className="absolute h-[106%] w-[106%] animate-[spin_42s_linear_infinite_reverse] rounded-full border border-sky-400/15" />
        <div className="absolute h-[90%] w-[90%] animate-[spin_28s_linear_infinite] rounded-full border border-white/10" />
        <div className="absolute h-[74%] w-[74%] animate-[spin_18s_linear_infinite_reverse] rounded-full border border-white/10" />

        <div className="absolute h-[128%] w-[36%] rounded-full border border-sky-300/10 rotate-12" />
        <div className="absolute h-[128%] w-[36%] rounded-full border border-yellow-300/10 -rotate-12" />
        <div className="absolute h-[36%] w-[128%] rounded-full border border-white/10" />
        <div className="absolute h-[52%] w-[114%] rounded-full border border-sky-200/10 rotate-[20deg]" />
        <div className="absolute h-[52%] w-[114%] rounded-full border border-yellow-200/10 -rotate-[20deg]" />

        <div className="absolute left-[10%] top-[18%] h-3 w-3 animate-pulse rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,0.95)]" />
        <div className="absolute right-[12%] top-[16%] h-3.5 w-3.5 animate-pulse rounded-full bg-yellow-300 shadow-[0_0_26px_rgba(253,224,71,0.95)]" />
        <div className="absolute bottom-[16%] left-[12%] h-3 w-3 animate-pulse rounded-full bg-sky-300 shadow-[0_0_26px_rgba(125,211,252,0.95)]" />
        <div className="absolute bottom-[12%] right-[16%] h-2.5 w-2.5 animate-pulse rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.9)]" />
        <div className="absolute left-[18%] bottom-[28%] h-2 w-2 animate-pulse rounded-full bg-yellow-200 shadow-[0_0_18px_rgba(254,240,138,0.85)]" />
        <div className="absolute right-[20%] top-[28%] h-2 w-2 animate-pulse rounded-full bg-sky-200 shadow-[0_0_18px_rgba(186,230,253,0.85)]" />

        <div className="relative h-[74%] w-[74%] overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.26),rgba(59,130,246,0.20),rgba(17,24,39,0.98)_72%)] shadow-[0_0_90px_rgba(250,204,21,0.14),0_0_150px_rgba(56,189,248,0.16)]">
          <div className="absolute inset-0 animate-[spin_40s_linear_infinite]">
            <div className="absolute left-[8%] top-[18%] h-10 w-20 rounded-full bg-white/10 blur-[1px]" />
            <div className="absolute right-[12%] top-[24%] h-14 w-24 rounded-full bg-sky-200/10 blur-[1px]" />
            <div className="absolute left-[18%] top-[44%] h-12 w-24 rounded-full bg-white/10 blur-[1px]" />
            <div className="absolute right-[18%] top-[55%] h-10 w-20 rounded-full bg-sky-100/10 blur-[1px]" />
            <div className="absolute left-[32%] bottom-[18%] h-14 w-24 rounded-full bg-white/10 blur-[1px]" />
            <div className="absolute left-[6%] bottom-[28%] h-8 w-16 rounded-full bg-sky-100/10 blur-[1px]" />
            <div className="absolute right-[22%] bottom-[20%] h-11 w-20 rounded-full bg-white/10 blur-[1px]" />
            <div className="absolute left-[26%] top-[14%] h-8 w-14 rounded-full bg-sky-100/10 blur-[1px]" />
            <div className="absolute right-[28%] top-[38%] h-8 w-16 rounded-full bg-white/10 blur-[1px]" />
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)] animate-[spin_12s_linear_infinite]" />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.30),transparent_30%)]" />

          <div className="absolute inset-x-[14%] top-[10%] h-px bg-white/20" />
          <div className="absolute inset-x-[10%] top-[28%] h-px bg-white/10" />
          <div className="absolute inset-x-[8%] top-1/2 h-px bg-white/10" />
          <div className="absolute inset-x-[10%] bottom-[28%] h-px bg-white/10" />
          <div className="absolute inset-x-[14%] bottom-[10%] h-px bg-white/20" />

          <div className="absolute inset-y-[8%] left-[24%] w-px bg-white/10" />
          <div className="absolute inset-y-[6%] left-1/2 w-px bg-white/10" />
          <div className="absolute inset-y-[8%] right-[24%] w-px bg-white/10" />
        </div>

        <div className="absolute -left-6 top-[16%] h-px w-28 bg-gradient-to-r from-transparent to-sky-300/60" />
        <div className="absolute -right-6 top-[26%] h-px w-28 bg-gradient-to-l from-transparent to-yellow-300/60" />
        <div className="absolute -left-2 bottom-[20%] h-px w-24 bg-gradient-to-r from-transparent to-white/40" />
        <div className="absolute -right-2 bottom-[16%] h-px w-24 bg-gradient-to-l from-transparent to-white/40" />

        <LanguageChip
          label={sourceLanguage}
          className="left-[-20px] top-[10%] border-sky-400/25 bg-sky-500/10 text-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.14)]"
        />
        <LanguageChip
          label={targetLanguage}
          className="right-[-20px] top-[10%] border-yellow-400/25 bg-yellow-500/10 text-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.14)]"
        />
        <LanguageChip
          label="Global Reach"
          className="left-[1%] bottom-[16%] border-white/15 bg-white/5 text-zinc-200"
        />
        <LanguageChip
          label="AI Translate"
          className="right-[1%] bottom-[12%] border-white/15 bg-white/5 text-zinc-200"
        />

        <div className="absolute left-1/2 top-[4%] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Live translation signal
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-sm font-semibold text-white">
              Ready for global output
            </span>
          </div>
        </div>

        <div className="absolute bottom-[2%] left-1/2 w-[94%] max-w-[560px] -translate-x-1/2 rounded-3xl border border-white/10 bg-black/35 p-4 backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.03)]">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-sky-400/15 bg-sky-500/10 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/80">
                From
              </p>
              <h3 className="mt-2 text-lg font-bold text-sky-100">
                {sourceLanguage}
              </h3>
              <p className="mt-1 text-xs text-sky-100/70">
                Source language input detected
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-400/15 bg-yellow-500/10 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-200/80">
                To
              </p>
              <h3 className="mt-2 text-lg font-bold text-yellow-100">
                {targetLanguage}
              </h3>
              <p className="mt-1 text-xs text-yellow-100/70">
                Target language output ready
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TranslatePage() {
  const [sourceLanguage, setSourceLanguage] = useState<Language>("English")
  const [targetLanguage, setTargetLanguage] = useState<Language>("French")
  const [inputText, setInputText] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const languageCount = useMemo(() => languages.length, [])

  const handleTranslate = async () => {
    try {
      if (!inputText.trim()) {
        setResult("Please enter text to translate.")
        return
      }

      setLoading(true)
      setResult("")

      const prompt = `
You are a professional translator.

Translate the user's text from ${sourceLanguage} to ${targetLanguage}.

Rules:
- Preserve the exact meaning.
- Keep the tone natural and fluent.
- Do not explain anything.
- Do not add notes.
- Return only the translated text.

Text:
${inputText}
      `.trim()

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: "translate",
          topic: prompt,
          platform: "Translation",
          audience: "Global Users",
          language: targetLanguage,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult(data.error || "Translation failed.")
        return
      }

      setResult((data.result || "").replace(/\*\*/g, "").trim())
    } catch {
      setResult("Translation failed.")
    } finally {
      setLoading(false)
    }
  }

  const swapLanguages = () => {
    const oldSource = sourceLanguage
    setSourceLanguage(targetLanguage)
    setTargetLanguage(oldSource)

    if (result.trim()) {
      setInputText(result)
      setResult("")
    }
  }

  const clearAll = () => {
    setInputText("")
    setResult("")
  }

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-zinc-950 p-8 shadow-[0_0_40px_rgba(250,204,21,0.06)]">
          <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="absolute right-[-120px] bottom-[-120px] h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300">
                CreatorGoat Translate
              </div>

              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-yellow-400 sm:text-5xl">
                Global Translation Engine
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                Translate content across {languageCount} languages with a luxury,
                AI-powered global workflow built for creators, products,
                marketplace listings, messages, captions, and international
                communication.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-yellow-500/20 bg-black/30 px-4 py-3 text-sm text-zinc-400">
                  <span className="font-semibold text-yellow-400">
                    {languageCount}
                  </span>{" "}
                  supported languages
                </div>

                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
                  Premium global module
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                  AI-powered translation flow
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <GlobeVisual
                sourceLanguage={sourceLanguage}
                targetLanguage={targetLanguage}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.04)]">
            <div className="mb-4">
              <label className="mb-2 block text-sm text-zinc-400">
                Source Language
              </label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value as Language)}
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Text to Translate
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text here..."
                className="min-h-[360px] w-full rounded-2xl border border-zinc-700 bg-black px-4 py-4 text-white outline-none transition focus:border-yellow-400"
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3">
            <button
              type="button"
              onClick={swapLanguages}
              className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/20"
            >
              Swap
            </button>

            <button
              type="button"
              onClick={handleTranslate}
              disabled={loading || !inputText.trim()}
              className="rounded-2xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Translating..." : "Translate"}
            </button>

            <button
              type="button"
              onClick={clearAll}
              className="rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Clear
            </button>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-zinc-950 p-6 shadow-[0_0_40px_rgba(250,204,21,0.04)]">
            <div className="mb-4">
              <label className="mb-2 block text-sm text-zinc-400">
                Target Language
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value as Language)}
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-yellow-400">Translation</h2>

                {result && (
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="rounded-xl bg-yellow-400 px-3 py-2 text-xs font-semibold text-black transition hover:opacity-90"
                  >
                    Copy
                  </button>
                )}
              </div>

              <pre className="min-h-[320px] whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                {result || "Your translated text will appear here."}
              </pre>
            </div>

            <div className="mt-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-zinc-300">
              This module supports CreatorGoat global translation workflows for AI
              content, messages, products, captions, and creator communication.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}