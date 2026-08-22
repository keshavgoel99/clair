import { useState } from 'react'

function Register({ onRegister, onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('DONOR')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!name || !email || !password) {
      setError('Please fill in all fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Registration failed'
        )
      }

      setSuccess(
        'Account created successfully. You can now sign in.'
      )

      setName('')
      setEmail('')
      setPassword('')
      setRole('DONOR')

      /*
       * Wait briefly so the user can see
       * the success message, then return to login.
       */
      setTimeout(() => {
        onRegister(data.user)
      }, 1000)

    } catch (error) {
      setError(
        error.message || 'Unable to create account.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">

      <div className="w-full max-w-md">

        {/* Brand */}

        <div className="mb-8 text-center">

          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900">
            <span className="text-xl font-bold text-white">
              C
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            CLAIR
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create your account
          </p>

        </div>


        {/* Card */}

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Get started
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Join the transparent funding network.
          </p>


          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >

            {/* Name */}

            <label className="text-sm font-medium text-slate-700">
              Full Name / Organization
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your name"
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />


            {/* Email */}

            <label className="mt-5 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />


            {/* Password */}

            <label className="mt-5 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Create a password"
              required
              minLength={6}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />


            {/* Role */}

            <label className="mt-5 block text-sm font-medium text-slate-700">
              Account Type
            </label>

            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="DONOR">
                Donor
              </option>

              <option value="NGO">
                NGO
              </option>

              <option value="VENDOR">
                Vendor
              </option>
            </select>


            {/* Error */}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}


            {/* Success */}

            {success && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm text-green-700">
                  {success}
                </p>
              </div>
            )}


            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Creating account...'
                : 'Create Account'}
            </button>

          </form>


          {/* Login */}

          <div className="mt-6 border-t border-slate-100 pt-6 text-center">

            <p className="text-sm text-slate-500">
              Already have an account?
            </p>

            <button
              onClick={onLogin}
              className="mt-2 text-sm font-semibold text-slate-900 hover:underline"
            >
              Sign In
            </button>

          </div>

        </div>


        <p className="mt-6 text-center text-xs text-slate-400">
          CLAIR • Transparent NGO Fund Tracking
        </p>

      </div>

    </div>
  )
}

export default Register