const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    password: {
        type: String,
        required: true,
        select: false // Never returned in queries by default
    },
    displayName: {
        type: String,
        trim: true,
        maxlength: 50,
        default: ''
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 200,
        default: ''
    },
    profileColor: {
        type: String,
        default: () => {
            const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    walletAddress: {
        type: String,
        lowercase: true,
        trim: true,
        sparse: true,
        default: null
    },
    nonce: {
        type: String,
        default: () => crypto.randomBytes(16).toString('hex')
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before save
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Regenerate nonce (for wallet auth)
UserSchema.methods.regenerateNonce = function () {
    this.nonce = crypto.randomBytes(16).toString('hex');
    return this.save();
};

module.exports = mongoose.model('User', UserSchema);
