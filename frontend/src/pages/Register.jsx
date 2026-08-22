import { useState } from 'react'

function Register({ onRegister, onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('DONOR')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!name || !email || !password) {
      alert('Please fill in all fields.')
      return
    }

    onRegister({
      name,
      email,
      role,
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold text-slate-900">
            CLAIR
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create your account
          </p>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Get started
          </h2>

          <form onSubmit={handleSubmit} className="mt-8">

            <label className="text-sm font-medium text-slate-700">
              Full Name / Organization
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <label className="mt-5 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <label className="mt-5 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <label className="mt-5 block text-sm font-medium text-slate-700">
              Account Type
            </label>

            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="DONOR">Donor</option>
              <option value="NGO">NGO</option>
              <option value="VENDOR">Vendor</option>
            </select>

            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
            >
              Create Account
            </button>

          </form>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center">

            <p className="text-sm text-slate-500">
              Already have an account?
            </p>

            <button
              onClick={onLogin}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Sign In
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Register