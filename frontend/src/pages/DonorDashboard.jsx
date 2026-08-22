function DonorDashboard({ pledges }) {
  const totalPledged = pledges.reduce(
    (total, pledge) => total + pledge.amount,
    0
  )

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">

      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Donor Dashboard
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Your Contributions
        </h2>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Total Pledged
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            ₹{totalPledged.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Active Pledges
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {pledges.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Verified Contributions
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            0
          </p>
        </div>

      </div>

      <section className="mt-10">

        <h3 className="text-xl font-bold text-slate-900">
          Pledge History
        </h3>

        <div className="mt-4 space-y-4">

          {pledges.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">

              <p className="font-medium text-slate-700">
                No pledges yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Your contributions will appear here.
              </p>

            </div>
          ) : (
            pledges.map((pledge) => (
              <div
                key={pledge.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >

                <div className="flex items-center justify-between">

                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {pledge.campaign.title}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      {pledge.campaign.ngo}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="font-bold text-slate-900">
                      ₹{pledge.amount.toLocaleString()}
                    </p>

                    <span className="text-xs font-medium text-amber-600">
                      Pledged
                    </span>

                  </div>

                </div>

              </div>
            ))
          )}

        </div>

      </section>

    </main>
  )
}

export default DonorDashboard