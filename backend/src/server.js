const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')

const {
  authenticateToken,
  authorizeRoles,
} = require('./middleware/authMiddleware')

const app = express()

const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


// PUBLIC ROUTES

app.get('/', (req, res) => {
  res.json({
    message: 'CLAIR API is running',
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CLAIR backend',
  })
})


// AUTH ROUTES

app.use('/api/auth', authRoutes)


// PROTECTED TEST ROUTE
//
// Any authenticated user can access this.

app.get(
  '/api/protected',
  authenticateToken,
  (req, res) => {
    res.json({
      message: 'You accessed a protected route',
      user: req.user,
    })
  }
)


// NGO-ONLY TEST ROUTE
//
// Only users whose JWT role is NGO
// can access this route.

app.get(
  '/api/ngo-test',
  authenticateToken,
  authorizeRoles('NGO'),
  (req, res) => {
    res.json({
      message: 'NGO authorization successful',
      user: req.user,
    })
  }
)


app.listen(PORT, () => {
  console.log(
    `CLAIR API running on http://localhost:${PORT}`
  )
})