import { useState } from 'react'

function App() {
  const [connected, setConnected] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              CLAIR
            </h1>
            <p className="text-xs text-slate-500">
              Transparent NGO Fund Tracking
            </p>
          </div>

          <button
            onClick={() => setConnected(!connected)}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            {connected ? 'Wallet Connected' : 'Connect Wallet'}
          </button>

        </div>
      </nav>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-6 py-16">

        <section className="max-w-3xl">

          <div className="mb-6 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            Blockchain + AI
          </div>

          <h2 className="text-5xl font-bold leading-tight tracking-tight text-slate-900">
            Know where every contribution goes.
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            CLAIR provides transparent, traceable and verifiable
            fund utilization for NGOs using blockchain, smart contracts
            and AI-powered document verification.
          </p>

          <div className="mt-8 flex gap-4">

            <button className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
              Make a Pledge
            </button>

            <button className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50">
              Explore Campaigns
            </button>

          </div>

        </section>

        {/* System Flow */}
        <section className="mt-20">

          <h3 className="text-2xl font-bold text-slate-900">
            How CLAIR works
          </h3>

          <div className="mt-8 grid gap-5 md:grid-cols-4">

            {[
              {
                number: '01',
                title: 'Pledge',
                description: 'Donor commits funds toward an NGO or campaign.',
              },
              {
                number: '02',
                title: 'Escrow',
                description: 'Funds are securely locked through a smart contract.',
              },
              {
                number: '03',
                title: 'Verify',
                description: 'AI checks invoices and delivery documentation.',
              },
              {
                number: '04',
                title: 'Release',
                description: 'Funds are released when conditions are satisfied.',
              },
            ].map((item) => (
              <div
                key={item.number}
                className="rounded-xl border border-slate-200 bg-white p-6"
              >
                <span className="text-sm font-bold text-blue-600">
                  {item.number}
                </span>

                <h4 className="mt-3 text-lg font-semibold text-slate-900">
                  {item.title}
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </div>
            ))}

          </div>

        </section>

      </main>

    </div>
  )
}

export default App