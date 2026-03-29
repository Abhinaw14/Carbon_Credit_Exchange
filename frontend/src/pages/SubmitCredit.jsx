import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { submitCredit } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineDocumentAdd } from 'react-icons/hi';

export default function SubmitCredit() {
    const { account, isConnected } = useWallet();
    const [form, setForm] = useState({
        projectName: '',
        location: '',
        amount: '',
        vintage: new Date().getFullYear().toString(),
        methodology: '',
        description: '',
        documentUrl: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isConnected) {
            toast.error('Please connect your wallet first');
            return;
        }
        if (parseFloat(form.amount) <= 0) {
            toast.error('CO2 offset must be a positive number');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                producer: account,
                metadata: {
                    projectName: form.projectName,
                    location: form.location,
                    amount: parseFloat(form.amount),
                    vintage: form.vintage,
                    methodology: form.methodology,
                    description: form.description,
                },
                documents: form.documentUrl ? [form.documentUrl] : [],
            };
            const result = await submitCredit(payload);
            if (result.success) {
                toast.success('Carbon credit submitted successfully!');
                setForm({ projectName: '', location: '', amount: '', vintage: new Date().getFullYear().toString(), methodology: '', description: '', documentUrl: '' });
            } else {
                toast.error(result.error || 'Submission failed');
            }
        } catch (err) {
            toast.error(err.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white">
                    <HiOutlineDocumentAdd size={20} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text">Submit Carbon Credit</h1>
                    <p className="text-text-muted text-sm">Register a new carbon offset project for verification</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Project Name *</label>
                        <input name="projectName" value={form.projectName} onChange={handleChange} className="input-field" placeholder="Solar Farm Alpha" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Location *</label>
                        <input name="location" value={form.location} onChange={handleChange} className="input-field" placeholder="Tamil Nadu, India" required />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">CO₂ Offset (tonnes) *</label>
                        <input name="amount" type="number" step="0.01" min="0.01" value={form.amount} onChange={handleChange} className="input-field" placeholder="150" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Vintage Year *</label>
                        <input name="vintage" value={form.vintage} onChange={handleChange} className="input-field" placeholder="2025" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Methodology</label>
                        <input name="methodology" value={form.methodology} onChange={handleChange} className="input-field" placeholder="VM0006" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1.5">Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} className="input-field min-h-[100px] resize-y" placeholder="Describe the carbon offset project..." />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1.5">Document URL (IPFS/HTTP)</label>
                    <input name="documentUrl" value={form.documentUrl} onChange={handleChange} className="input-field" placeholder="ipfs://... or https://..." />
                </div>

                <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading || !isConnected}>
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            Submitting...
                        </span>
                    ) : 'Submit Carbon Credit'}
                </button>

                {!isConnected && (
                    <p className="text-center text-warning text-sm">Connect your wallet to submit</p>
                )}
            </form>
        </div>
    );
}
