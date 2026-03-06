import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import {
  recordTransaction,
  getTransactions,
  getFinancialSummary,
  getProfitAnalysis,
  getHarvestCost,
  manageBankAccount,
  getBankAccount,
  updateTransactionStatus
} from '../controllers/finance.controller.js'

const router = express.Router()

router.post('/transaction', verifyJWT, recordTransaction)
router.get('/transactions', verifyJWT, getTransactions)
router.get('/summary', verifyJWT, getFinancialSummary)
router.get('/harvest-cost', verifyJWT, getHarvestCost)
router.get('/crop/:cropId/profit', verifyJWT, getProfitAnalysis)

// Bank account routes
router.post('/bank-account', verifyJWT, manageBankAccount)
router.get('/bank-account', verifyJWT, getBankAccount)

// Transaction status update
router.put('/transaction/:transactionId/status', verifyJWT, updateTransactionStatus)

export default router
