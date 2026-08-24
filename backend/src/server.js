const express = require('express')
const cors = require('cors')
require('dotenv').config()

<<<<<<< HEAD
const vendorRoutes = require("./routes/vendorRoutes");
const authRoutes = require('./routes/authRoutes')
const campaignRoutes = require('./routes/campaignRoutes')
const pledgeRoutes = require('./routes/pledgeRoutes')
const procurementRoutes = require("./routes/procurementRoutes");
const documentRoutes = require("./routes/documentRoutes");
const verificationRoutes =  require("./routes/verificationRoutes");
=======
const vendorRoutes = require("./routes/vendorRoutes")
const authRoutes = require('./routes/authRoutes')
const campaignRoutes = require('./routes/campaignRoutes')
const pledgeRoutes = require('./routes/pledgeRoutes')
const procurementRoutes = require("./routes/procurementRoutes")
const documentRoutes = require("./routes/documentRoutes")
const verificationRoutes = require("./routes/verificationRoutes")
const aiRoutes = require("./routes/aiRoutes")

>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
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


<<<<<<< HEAD
// AUTH ROUTES
=======
// API ROUTES
>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970

app.use('/api/auth', authRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/pledges', pledgeRoutes)
<<<<<<< HEAD
app.use("/api/procurements", procurementRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/verifications", verificationRoutes);
=======
app.use("/api/procurements", procurementRoutes)
app.use("/api/vendors", vendorRoutes)
app.use("/api/documents", documentRoutes)
app.use("/api/verifications", verificationRoutes)
app.use("/api/ai", aiRoutes)


>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
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


<<<<<<< HEAD
=======
// START SERVER

>>>>>>> 2d35fa3de61199c075ef1568ce1a9c5f2e5f9970
app.listen(PORT, () => {
  console.log(
    `CLAIR API running on http://localhost:${PORT}`
  )
})