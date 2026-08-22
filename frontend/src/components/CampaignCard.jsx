function CampaignCard({ campaign, onPledge }) {
  const percentage = Math.min(
    Math.round((campaign.raised / campaign.target) * 100),
    100
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {campaign.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {campaign.ngo}
          </p>
        </div>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          {campaign.category}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {campaign.description}
      </p>

      <div className="mt-6">

        <div className="flex justify-between text-sm">
          <span className="font-medium text-slate-900">
            ₹{campaign.raised.toLocaleString()}
          </span>

          <span className="text-slate-500">
            of ₹{campaign.target.toLocaleString()}
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          {percentage}% funded
        </p>

      </div>

      <button
        onClick={() => onPledge(campaign)}
        className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700"
      >
        Make a Pledge
      </button>

    </div>
  )
}

export default CampaignCard