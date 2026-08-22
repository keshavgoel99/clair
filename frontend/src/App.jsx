import { useState } from 'react'
import Home from './pages/Home'
import DonorDashboard from './pages/DonorDashboard'
import PledgeModal from './components/PledgeModal'

function App() {
  const [page, setPage] = useState('home')
  const [connected, setConnected] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [pledges, setPledges] = useState([])

  const handlePledge = (campaign) => {
    if (!connected) {
      alert('Please connect your wallet first.')
      return
    }

    setSelectedCampaign(campaign)
  }

  const handleSubmitPledge = ({ campaign, amount }) => {
    const newPledge = {
      id: Date.now(),
      campaign,
      amount,
    }

    setPledges((current) => [...current, newPledge])
    setSelectedCampaign(null)
    setPage('dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <button
            onClick={() => setPage('home')}
            className="text-left"
          >
            <h1 className="text-2xl font-bold text-slate-900">
              CLAIR
            </h1>

            <p className="text-xs text-slate-500">
              Transparent NGO Fund Tracking
            </p>
          </button>

          <div className="flex items-center gap-4">

            <button
              onClick={() => setPage('home')}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Campaigns
            </button>

            <button
              onClick={() => setPage('dashboard')}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              My Dashboard
            </button>

            <button
              onClick={() => setConnected(!connected)}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              {connected ? 'Wallet Connected' : 'Connect Wallet'}
            </button>

          </div>

        </div>

      </nav>

      {/* Page */}
      {page === 'home' && (
        <Home onPledge={handlePledge} />
      )}

      {page === 'dashboard' && (
        <DonorDashboard pledges={pledges} />
      )}

      {/* Pledge Modal */}
      {selectedCampaign && (
        <PledgeModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onSubmit={handleSubmitPledge}
        />
      )}

    </div>
  )
}

export default App