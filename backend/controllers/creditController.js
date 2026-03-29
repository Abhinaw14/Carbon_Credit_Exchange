const CarbonCreditSubmission = require('../models/CarbonCreditSubmission');

// @desc    Submit carbon credit metadata
// @route   POST /api/credits/submit
// @access  Public (Producer)
exports.submitCredit = async (req, res) => {
    try {
        const { producer, metadata, documents } = req.body;

        const submission = await CarbonCreditSubmission.create({
            producer,
            metadata,
            documents
        });

        res.status(201).json({
            success: true,
            data: submission
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get all credits (with optional status filter)
// @route   GET /api/credits?status=PENDING&producer=0x...
// @access  Public
exports.getAllCredits = async (req, res) => {
    try {
        const filter = {};

        // Optional filters
        if (req.query.status) {
            filter.status = req.query.status.toUpperCase();
        }
        if (req.query.producer) {
            filter.producer = req.query.producer.toLowerCase();
        }

        const credits = await CarbonCreditSubmission.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: credits.length,
            data: credits
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get single credit by ID
// @route   GET /api/credits/:id
// @access  Public
exports.getCreditById = async (req, res) => {
    try {
        const credit = await CarbonCreditSubmission.findById(req.params.id);

        if (!credit) {
            return res.status(404).json({
                success: false,
                error: 'Credit submission not found'
            });
        }

        res.status(200).json({
            success: true,
            data: credit
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get all pending credits
// @route   GET /api/credits/pending
// @access  Private (Admin)
exports.getPendingCredits = async (req, res) => {
    try {
        const credits = await CarbonCreditSubmission.find({ status: 'PENDING' });

        res.status(200).json({
            success: true,
            count: credits.length,
            data: credits
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Approve a credit submission
// @route   PATCH /api/credits/:id/approve
// @access  Private (Admin)
exports.approveCredit = async (req, res) => {
    try {
        const credit = await CarbonCreditSubmission.findById(req.params.id);

        if (!credit) {
            return res.status(404).json({
                success: false,
                error: 'Credit submission not found'
            });
        }

        // Guard: Only PENDING credits can be approved
        if (credit.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: `Cannot approve a credit with status '${credit.status}'. Only PENDING credits can be approved.`
            });
        }

        credit.status = 'APPROVED';
        credit.approvalDate = Date.now();

        await credit.save();

        res.status(200).json({
            success: true,
            data: credit
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Reject a credit submission
// @route   PATCH /api/credits/:id/reject
// @access  Private (Admin)
exports.rejectCredit = async (req, res) => {
    try {
        const credit = await CarbonCreditSubmission.findById(req.params.id);

        if (!credit) {
            return res.status(404).json({
                success: false,
                error: 'Credit submission not found'
            });
        }

        // Guard: Only PENDING credits can be rejected
        if (credit.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: `Cannot reject a credit with status '${credit.status}'. Only PENDING credits can be rejected.`
            });
        }

        const { reason } = req.body;
        if (!reason || reason.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Rejection reason is required'
            });
        }

        credit.status = 'REJECTED';
        credit.rejectionReason = reason;

        await credit.save();

        res.status(200).json({
            success: true,
            data: credit
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Mark a credit as minted (store tokenId, set minted=true)
// @route   PATCH /api/credits/:id/mint
// @access  Private (Authenticated)
exports.markAsMinted = async (req, res) => {
    try {
        const credit = await CarbonCreditSubmission.findById(req.params.id);

        if (!credit) {
            return res.status(404).json({
                success: false,
                error: 'Credit submission not found'
            });
        }

        if (credit.minted) {
            return res.status(400).json({
                success: false,
                error: 'This credit has already been minted'
            });
        }

        if (credit.status !== 'APPROVED') {
            return res.status(400).json({
                success: false,
                error: 'Only approved credits can be minted'
            });
        }

        const { tokenId } = req.body;
        credit.minted = true;
        credit.blockchainTokenId = tokenId || null;
        await credit.save();

        res.status(200).json({
            success: true,
            data: credit
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
