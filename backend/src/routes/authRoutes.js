const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const prisma = require('../db/prisma')

const {
  authenticateToken,
} = require('../middleware/authMiddleware')

const router = express.Router()

// =====================================================
// REGISTER
// =====================================================

router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: 'All fields are required',
      })
    }

    const allowedRoles = [
      'DONOR',
      'NGO',
      'VENDOR',
    ]

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role',
      })
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      })

    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists',
      })
    }

    const passwordHash =
      await bcrypt.hash(password, 12)

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
        },
      })

    res.status(201).json({
      message:
        'Account created successfully',

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

  } catch (error) {
    console.error(
      'Register error:',
      error
    )

    res.status(500).json({
      message: 'Server error',
    })
  }
})


// =====================================================
// LOGIN
// =====================================================

router.post('/login', async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message:
          'Email and password are required',
      })
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      })

    if (!user) {
      return res.status(401).json({
        message:
          'Invalid email or password',
      })
    }

    const passwordValid =
      await bcrypt.compare(
        password,
        user.passwordHash
      )

    if (!passwordValid) {
      return res.status(401).json({
        message:
          'Invalid email or password',
      })
    }

    const token =
      jwt.sign(
        {
          id: user.id,
          role: user.role,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
        }
      )

    res.json({
      message: 'Login successful',

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

  } catch (error) {
    console.error(
      'Login error:',
      error
    )

    res.status(500).json({
      message: 'Server error',
    })
  }
})


// =====================================================
// SAVE WALLET ADDRESS
// =====================================================
// Exact route:
// PATCH /api/auth/wallet
//
// Saves the currently authenticated user's
// MetaMask wallet address.
// =====================================================

router.patch(
  '/wallet',
  authenticateToken,
  async (req, res) => {
    try {
      const {
        walletAddress,
      } = req.body

      if (
        typeof walletAddress !== 'string' ||
        !/^0x[a-fA-F0-9]{40}$/.test(
          walletAddress
        )
      ) {
        return res.status(400).json({
          message:
            'Invalid Ethereum wallet address',
        })
      }

      const user =
        await prisma.user.update({
          where: {
            id: req.user.id,
          },

          data: {
            walletAddress:
              walletAddress.toLowerCase(),
          },

          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            walletAddress: true,
          },
        })

      res.json({
        message:
          'Wallet address saved successfully',

        user,
      })

    } catch (error) {
      console.error(
        'Save wallet error:',
        error
      )

      res.status(500).json({
        message:
          'Unable to save wallet address',
      })
    }
  }
)


// =====================================================
// GET MY WALLET ADDRESS
// =====================================================
// Exact route:
// GET /api/auth/wallet
//
// Returns the wallet belonging to the
// currently authenticated user.
// =====================================================

router.get(
  '/wallet',
  authenticateToken,
  async (req, res) => {
    try {
      const user =
        await prisma.user.findUnique({
          where: {
            id: req.user.id,
          },

          select: {
            id: true,
            walletAddress: true,
          },
        })

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        })
      }

      res.json({
        walletAddress:
          user.walletAddress || null,
      })

    } catch (error) {
      console.error(
        'Get wallet error:',
        error
      )

      res.status(500).json({
        message:
          'Unable to fetch wallet address',
      })
    }
  }
)


module.exports = router