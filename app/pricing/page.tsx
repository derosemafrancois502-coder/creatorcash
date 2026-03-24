export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black p-12 text-white">
      <h1 className="text-5xl font-bold text-yellow-400 text-center">
        CreatorGoat Pricing
      </h1>

      <p className="mt-4 text-center text-zinc-400">
        Choose the plan that fits your creator journey.
      </p>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">

        {/* Starter */}
        <div className="rounded-3xl border border-yellow-500/30 bg-zinc-950 p-8">
          <h2 className="text-2xl font-bold text-yellow-400">Starter</h2>
          <p className="mt-4 text-5xl font-bold">$9</p>
          <p className="mt-2 text-zinc-400">per month</p>

          <ul className="mt-6 space-y-2 text-zinc-300">
            <li>• 100 AI generations</li>
            <li>• Hooks</li>
            <li>• Captions</li>
            <li>• Scripts</li>
          </ul>

          <button className="mt-8 w-full rounded-2xl bg-yellow-400 px-4 py-3 font-semibold text-black">
            Start Starter
          </button>
        </div>

        {/* Pro */}
        <div className="rounded-3xl border border-yellow-400 bg-zinc-950 p-8">
          <h2 className="text-2xl font-bold text-yellow-400">Pro</h2>
          <p className="mt-4 text-5xl font-bold">$19</p>
          <p className="mt-2 text-zinc-400">per month</p>

          <ul className="mt-6 space-y-2 text-zinc-300">
            <li>• 500 AI generations</li>
            <li>• All AI Tools</li>
            <li>• Leads CRM</li>
            <li>• Creator Links</li>
          </ul>

          <button className="mt-8 w-full rounded-2xl bg-yellow-400 px-4 py-3 font-semibold text-black">
            Start Pro
          </button>
        </div>

        {/* Founder Elite */}
        <div className="rounded-3xl border border-yellow-500/30 bg-zinc-950 p-8">
          <h2 className="text-2xl font-bold text-yellow-400">Founder Elite</h2>
          <p className="mt-4 text-5xl font-bold">$29</p>
          <p className="mt-2 text-zinc-400">per month</p>

          <ul className="mt-6 space-y-2 text-zinc-300">
            <li>• Unlimited AI</li>
            <li>• Marketplace selling</li>
            <li>• Priority features</li>
            <li>• Founder badge</li>
          </ul>

          <button className="mt-8 w-full rounded-2xl bg-yellow-400 px-4 py-3 font-semibold text-black">
            Start Elite
          </button>
        </div>

      </div>
    </div>
  )
}