import Link from "next/link"

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-10 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-500/30 bg-zinc-950 p-10">
        <p className="text-sm uppercase tracking-[0.25em] text-yellow-500/70">
          CreatorGoat
        </p>

        <h1 className="mt-4 text-4xl font-bold text-yellow-400">
          Upgrade to Pro
        </h1>

        <p className="mt-4 text-lg text-zinc-300">
          Unlock the full CreatorGoat system and upgrade to the Pro plan for
          <span className="font-bold text-yellow-400"> $19/month</span>.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-yellow-500/20 bg-black/40 p-5">
            <h2 className="text-lg font-semibold text-yellow-400">
              What you get
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>• 500 AI generations</li>
              <li>• Full AI Viral Content Engine</li>
              <li>• Hooks, Captions, Scripts, Replies</li>
              <li>• Product Writer, Growth, Email, Course Builder</li>
              <li>• Leads CRM</li>
              <li>• Creator Links</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-black/40 p-5">
            <h2 className="text-lg font-semibold text-yellow-400">
              Why Pro
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>• Create content faster</li>
              <li>• Capture more leads</li>
              <li>• Build your creator business</li>
              <li>• Sell digital and physical products</li>
              <li>• Access premium workflow tools</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-black/40 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Pro Plan
          </p>
          <p className="mt-2 text-5xl font-bold text-yellow-400">$19</p>
          <p className="mt-2 text-zinc-400">per month</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <button className="rounded-2xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-black transition hover:scale-105 hover:shadow-[0_0_25px_rgba(250,204,21,0.5)]">
            Continue to Upgrade
          </button>

          <Link
            href="/pricing"
            className="rounded-2xl border border-yellow-400 px-6 py-3 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
          >
            Compare Plans
          </Link>
        </div>
      </div>
    </div>
  )
}