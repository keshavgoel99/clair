const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')

const app = express()

const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

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

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
  console.log(
    `CLAIR API running on http://localhost:${PORT}`
  )
})