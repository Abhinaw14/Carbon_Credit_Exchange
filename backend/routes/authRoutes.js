const express = require('express');
const { register, login, getMe, updateProfile, linkWallet, getNonce, verifySignature } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Public — registration and login
router.post('/register', register);
router.post('/login', login);

// Public — wallet-based auth
router.get('/nonce/:walletAddress', getNonce);
router.post('/verify', verifySignature);

// Protected — profile
router.get('/me', verifyToken, getMe);
router.patch('/profile', verifyToken, updateProfile);
router.patch('/link-wallet', verifyToken, linkWallet);

module.exports = router;
