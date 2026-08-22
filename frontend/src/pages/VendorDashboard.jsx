function VendorDashboard() {
  const procurements = [
    {
      id: 'PROC-001',
      campaign: 'Flood Relief Kits',
      ngo: 'Hope Relief Foundation',
      items: '500 Relief Kits',
      amount: '₹2,50,000',
      status: 'Awaiting Delivery',
    },
    {
      id: 'PROC-004',
      campaign: 'Community Food Program',
      ngo: 'Community Care NGO',
      items: '1000 Food Packages',
      amount: '₹3,20,000',
      status: 'Verification Pending',
    },
  ]

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Vendor Portal
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            ABC Relief Supplies
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Manage assigned procurements, submit proof and track payments.
          </p>
        </div>

      </div>

      {/* Statistics */}
      <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Assigned Orders
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            8
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Pending Delivery
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            2
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Verification Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            1
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Payments Received
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹9,80,000
          </p>
        </div>

      </section>

      {/* Procurement List */}
      <section className="mt-10">

        <h3 className="text-xl font-bold text-slate-900">
          Assigned Procurements
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Complete deliveries and submit supporting documents.
        </p>

        <div className="mt-5 space-y-4">

          {procurements.map((procurement) => (

            <div
              key={procurement.id}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >

              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                <div>

                  <div className="flex items-center gap-3">

                    <h4 className="font-semibold text-slate-900">
                      {procurement.id}
                    </h4>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        procurement.status === 'Verification Pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {procurement.status}
                    </span>

                  </div>

                  <h5 className="mt-3 font-medium text-slate-800">
                    {procurement.campaign}
                  </h5>

                  <p className="mt-1 text-sm text-slate-500">
                    NGO: {procurement.ngo}
                  </p>

                  <p className="mt-3 text-sm text-slate-600">
                    Items: {procurement.items}
                  </p>

                </div>

                <div className="md:text-right">

                  <p className="text-lg font-bold text-slate-900">
                    {procurement.amount}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Escrowed amount
                  </p>

                  <button className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700">
                    View Procurement
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* Submission Information */}
      <section className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-6">

        <h3 className="text-lg font-bold text-slate-900">
          Delivery & Verification
        </h3>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          After completing a procurement, submit your invoice, delivery
          receipt and supporting images. CLAIR's verification system will
          analyze the submitted documents before the escrowed funds are
          released.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">

          <span className="rounded-lg bg-white px-4 py-2 text-sm text-slate-700">
            Invoice
          </span>

          <span className="rounded-lg bg-white px-4 py-2 text-sm text-slate-700">
            Delivery Receipt
          </span>

          <span className="rounded-lg bg-white px-4 py-2 text-sm text-slate-700">
            Images
          </span>

          <span className="rounded-lg bg-white px-4 py-2 text-sm text-slate-700">
            AI Verification
          </span>

        </div>

      </section>

    </main>
  )
}

export default VendorDashboard