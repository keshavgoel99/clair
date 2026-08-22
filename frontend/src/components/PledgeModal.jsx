import { useState } from 'react'

function PledgeModal({ campaign, onClose, onSubmit }) {
  const [amount, setAmount] = useState('')

  if (!campaign) return null

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!amount || Number(amount) <= 0) {
      return
    }

    onSubmit({
      campaign,
      amount: Number(amount),
    })

    setAmount('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <div className="flex items-start justify-between">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Make a Pledge
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {campaign.title}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-xl text-slate-400 hover:text-slate-700"
          >
            ×
          </button>

        </div>

        <form onSubmit={handleSubmit} className="mt-6">

          <label className="text-sm font-medium text-slate-700">
            Pledge Amount
          </label>

          <div className="mt-2 flex items-center rounded-lg border border-slate-300 px-4">

            <span className="text-slate-500">
              ₹
            </span>

            <input
              type="number"
              min="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              className="w-full border-0 px-3 py-3 outline-none"
            />

          </div>

          <div className="mt-6 rounded-lg bg-slate-50 p-4">

            <p className="text-xs text-slate-500">
              Your pledge will be associated with
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {campaign.title}
            </p>

          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
          >
            Continue with Pledge
          </button>

        </form>

      </div>

    </div>
  )
}

export default PledgeModal