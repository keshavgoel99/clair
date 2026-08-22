function NGODashboard() {
  const stats = [
    {
      label: 'Total Pledged',
      value: '₹12,50,000',
    },
    {
      label: 'Funds in Escrow',
      value: '₹8,20,000',
    },
    {
      label: 'Procurements',
      value: '12',
    },
    {
      label: 'Completed',
      value: '8',
    },
  ]

  const procurements = [
    {
      id: 'PROC-001',
      campaign: 'Flood Relief Kits',
      vendor: 'ABC Relief Supplies',
      amount: '₹2,50,000',
      status: 'Awaiting Delivery',
    },
    {
      id: 'PROC-002',
      campaign: 'School Supplies',
      vendor: 'EduMart Supplies',
      amount: '₹1,80,000',
      status: 'Verification Pending',
    },
    {
      id: 'PROC-003',
      campaign: 'Community Food Program',
      vendor: 'Fresh Foods India',
      amount: '₹3,20,000',
      status: 'Completed',
    },
  ]

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">

      {/* Header */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            NGO Dashboard
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Hope Relief Foundation
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Manage campaigns, procurements and fund utilization.
          </p>
        </div>

        <button className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700">
          + Create Procurement
        </button>

      </div>

      {/* Statistics */}

      <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >

            <p className="text-sm text-slate-500">
              {stat.label}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {stat.value}
            </p>

          </div>
        ))}

      </section>

      {/* Escrow information */}

      <section className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-6">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>

            <p className="text-sm font-medium text-blue-700">
              Smart Contract Escrow
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-900">
              ₹8,20,000 currently secured
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Funds are locked under predefined procurement conditions
              until verification is completed.
            </p>

          </div>

          <button className="rounded-lg border border-blue-200 bg-white px-5 py-3 text-sm font-medium text-blue-700">
            View Blockchain Record
          </button>

        </div>

      </section>

      {/* Procurements */}

      <section className="mt-10">

        <div className="flex items-center justify-between">

          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Active Procurements
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Track vendor purchases and verification status.
            </p>
          </div>

          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
          </button>

        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">

          <div className="hidden grid-cols-5 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">

            <span>Procurement</span>
            <span>Campaign</span>
            <span>Vendor</span>
            <span>Amount</span>
            <span>Status</span>

          </div>

          {procurements.map((procurement) => (

            <div
              key={procurement.id}
              className="grid gap-3 border-b border-slate-100 px-6 py-5 last:border-0 md:grid-cols-5 md:items-center"
            >

              <div>
                <p className="font-medium text-slate-900">
                  {procurement.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-700">
                  {procurement.campaign}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-700">
                  {procurement.vendor}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900">
                  {procurement.amount}
                </p>
              </div>

              <div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    procurement.status === 'Completed'
                      ? 'bg-green-100 text-green-700'
                      : procurement.status === 'Verification Pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {procurement.status}
                </span>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  )
}

export default NGODashboard