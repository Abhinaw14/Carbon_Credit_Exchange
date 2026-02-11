const CarbonCreditSubmission = require('../models/CarbonCreditSubmission');

// @desc    Submit carbon credit metadata
// @route   POST /api/credits/submit
// @access  Public (Producer)
exports.submitCredit = async (req, res) => {
    try {
        const { producer, metadata, documents } = req.body;

        const submission = await CarbonCreditSubmission.create({
            producer, // Wallet address
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
