const mongoose = require('mongoose');

const CarbonCreditSubmissionSchema = new mongoose.Schema({
    producer: {
        type: String, // Wallet address
        required: true,
        lowercase: true
    },
    metadata: {
        projectName: { type: String, required: true },
        location: { type: String, required: true },
        amount: { type: Number, required: true },
        vintage: { type: String, required: true },
        methodology: { type: String }
    },
    documents: [{
        type: String // URL or file path
    }],
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    rejectionReason: {
        type: String
    },
    approvalDate: {
        type: Date
    },
    blockchainTokenId: {
        type: String // Populated after minting if available/tracked
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CarbonCreditSubmission', CarbonCreditSubmissionSchema);
