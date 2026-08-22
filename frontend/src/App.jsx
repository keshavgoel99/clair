import { useState } from 'react'

import Home from './pages/Home'
import DonorDashboard from './pages/DonorDashboard'
import NGODashboard from './pages/NGODashboard'
import VendorDashboard from './pages/VendorDashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import PledgeModal from './components/PledgeModal'

function App() {
  const [authPage, setAuthPage] = useState('login')
  const [user, setUser] = useState(null)

  const [page, setPage] = useState('dashboard')
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  const [pledges, setPledges] = useState([])

  /*
   * LOGIN
   *
   * Temporary mock authentication.
   * Later this will call our Node.js backend.
   */
  const handleLogin = (email) => {
    let role = 'DONOR'

    if (email.toLowerCase().includes('ngo')) {
      role = 'NGO'
    }

    if (email.toLowerCase().includes('vendor')) {
      role = 'VENDOR'
    }

    setUser({
      name:
        role === 'NGO'
          ? 'Hope Relief Foundation'
          : role === 'VENDOR'
            ? 'ABC Relief Supplies'
            : 'Donor',
      email,
      role,
    })

    setPage('dashboard')
  }

  /*
   * REGISTER
   */
  const handleRegister = ({ name, email, role }) => {
    setUser({
      name,
      email,
      role,
    })

    setPage('dashboard')
  }

  /*
   * LOGOUT
   */
  const handleLogout = () => {
    setUser(null)
    setAuthPage('login')
  }

  /*
   * DONOR PLEDGE
   */
  const handlePledge = (campaign) => {
    if (!user) {
      setAuthPage('login')
      return
    }

    setSelectedCampaign(campaign)
  }

  const handleSubmitPledge = ({ campaign, amount }) => {
    const newPledge = {
      id: Date.now(),
      campaign,
      amount,
      status: 'Pledged',
    }

    setPledges((current) => [...current, newPledge])

    setSelectedCampaign(null)
    setPage('dashboard')
  }

  /*
   * AUTHENTICATION GATE
   */
  if (!user) {
    if (authPage === 'register') {
      return (
        <Register
          onRegister={handleRegister}
          onLogin={() => setAuthPage('login')}
        />
      )
    }

    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => setAuthPage('register')}
      />
    )
  }

  /*
   * ROLE-BASED APPLICATION
   */

  if (user.role === 'NGO') {
    return (
      <div className="min-h-screen bg-slate-50">

        <nav className="border-b border-slate-200 bg-white">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                CLAIR
              </h1>

              <p className="text-xs text-slate-500">
                NGO Portal
              </p>
            </div>

            <div className="flex items-center gap-5">

              <span className="text-sm text-slate-600">
                {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>

            </div>

          </div>

        </nav>

        <NGODashboard />

      </div>
    )
  }

  if (user.role === 'VENDOR') {
    return (
      <div className="min-h-screen bg-slate-50">

        <nav className="border-b border-slate-200 bg-white">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                CLAIR
              </h1>

              <p className="text-xs text-slate-500">
                Vendor Portal
              </p>
            </div>

            <div className="flex items-center gap-5">

              <span className="text-sm text-slate-600">
                {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>

            </div>

          </div>

        </nav>

        <VendorDashboard />

      </div>
    )
  }

  /*
   * DONOR APPLICATION
   */

  return (
    <div className="min-h-screen bg-slate-50">

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
              Donor Portal
            </p>
          </button>

          <div className="flex items-center gap-5">

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
              My Pledges
            </button>

            <span className="text-sm text-slate-600">
              {user.name}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>

          </div>

        </div>

      </nav>

      {page === 'home' && (
        <Home onPledge={handlePledge} />
      )}

      {page === 'dashboard' && (
        <DonorDashboard pledges={pledges} />
      )}

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