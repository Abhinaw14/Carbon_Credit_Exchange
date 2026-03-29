const express = require('express');
const { submitCredit, getAllCredits, getCreditById, getPendingCredits, approveCredit, rejectCredit, markAsMinted } = require('../controllers/creditController');
const { verifyToken, requireRole, validateCreditSubmission } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllCredits);

// Admin only — must be BEFORE /:id to avoid matching "pending" as an id
router.get('/pending', verifyToken, requireRole('ADMIN'), getPendingCredits);

// Public — single credit by id
router.get('/:id', getCreditById);

// Protected — any authenticated user can submit
router.post('/submit', verifyToken, validateCreditSubmission, submitCredit);

// Protected — mark credit as minted after NFT creation
router.patch('/:id/mint', verifyToken, markAsMinted);

// Admin only
router.patch('/:id/approve', verifyToken, requireRole('ADMIN'), approveCredit);
router.patch('/:id/reject', verifyToken, requireRole('ADMIN'), rejectCredit);

module.exports = router;
