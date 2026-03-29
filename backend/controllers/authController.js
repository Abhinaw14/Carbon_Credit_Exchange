const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const issueToken = (user) => {
    return jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// ─── Traditional Auth ───────────────────────────────

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { username, password, displayName } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required' });
        }
        if (username.length < 3) {
            return res.status(400).json({ success: false, error: 'Username must be at least 3 characters' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
        }

        // Check if username exists
        const existing = await User.findOne({ username: username.toLowerCase() });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Username already taken' });
        }

        // First user gets ADMIN, rest get USER
        const userCount = await User.countDocuments();
        const role = userCount === 0 ? 'ADMIN' : 'USER';

        const user = await User.create({
            username: username.toLowerCase(),
            password,
            displayName: displayName || username,
            role
        });

        const token = issueToken(user);

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    displayName: user.displayName,
                    role: user.role,
                    profileColor: user.profileColor,
                    bio: user.bio,
                    walletAddress: user.walletAddress
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required' });
        }

        const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = issueToken(user);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    displayName: user.displayName,
                    role: user.role,
                    profileColor: user.profileColor,
                    bio: user.bio,
                    walletAddress: user.walletAddress
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─── Profile ────────────────────────────────────────

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                role: user.role,
                profileColor: user.profileColor,
                bio: user.bio,
                walletAddress: user.walletAddress,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * PATCH /api/auth/profile
 */
const updateProfile = async (req, res) => {
    try {
        const { displayName, bio, profileColor } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (displayName !== undefined) user.displayName = displayName;
        if (bio !== undefined) user.bio = bio;
        if (profileColor !== undefined) user.profileColor = profileColor;

        await user.save();

        res.json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                role: user.role,
                profileColor: user.profileColor,
                bio: user.bio,
                walletAddress: user.walletAddress
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─── Wallet Linking ─────────────────────────────────

/**
 * PATCH /api/auth/link-wallet
 * Body: { walletAddress }
 * Links a MetaMask wallet to the logged-in user account.
 */
const linkWallet = async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress || !ethers.isAddress(walletAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid wallet address' });
        }

        const wallet = walletAddress.toLowerCase();

        // Check if wallet is already linked to someone else
        const existing = await User.findOne({ walletAddress: wallet });
        if (existing && existing._id.toString() !== req.user.userId) {
            return res.status(400).json({ success: false, error: 'This wallet is linked to another account' });
        }

        const user = await User.findById(req.user.userId);
        user.walletAddress = wallet;
        await user.save();

        res.json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                displayName: user.displayName,
                role: user.role,
                profileColor: user.profileColor,
                bio: user.bio,
                walletAddress: user.walletAddress
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ─── Wallet-based Auth (kept for direct MetaMask login) ──

/**
 * GET /api/auth/nonce/:walletAddress
 */
const getNonce = async (req, res) => {
    try {
        const walletAddress = req.params.walletAddress.toLowerCase();

        if (!ethers.isAddress(walletAddress)) {
            return res.status(400).json({ success: false, error: 'Invalid wallet address' });
        }

        const user = await User.findOne({ walletAddress });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'No account linked to this wallet. Please register and link your wallet first.'
            });
        }

        const message = `Sign this message to authenticate with CarbonExchange.\n\nWallet: ${walletAddress}\nNonce: ${user.nonce}`;

        res.json({
            success: true,
            data: { message, nonce: user.nonce }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * POST /api/auth/verify
 */
const verifySignature = async (req, res) => {
    try {
        const { walletAddress, signature } = req.body;
        if (!walletAddress || !signature) {
            return res.status(400).json({ success: false, error: 'walletAddress and signature are required' });
        }

        const wallet = walletAddress.toLowerCase();
        const user = await User.findOne({ walletAddress: wallet });
        if (!user) {
            return res.status(404).json({ success: false, error: 'No account linked to this wallet.' });
        }

        const message = `Sign this message to authenticate with CarbonExchange.\n\nWallet: ${wallet}\nNonce: ${user.nonce}`;
        const recoveredAddress = ethers.verifyMessage(message, signature).toLowerCase();

        if (recoveredAddress !== wallet) {
            return res.status(401).json({ success: false, error: 'Signature verification failed' });
        }

        const token = issueToken(user);
        await user.regenerateNonce();

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    displayName: user.displayName,
                    role: user.role,
                    profileColor: user.profileColor,
                    bio: user.bio,
                    walletAddress: user.walletAddress
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { register, login, getMe, updateProfile, linkWallet, getNonce, verifySignature };
