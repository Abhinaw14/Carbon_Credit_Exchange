import { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getOwnedTokens, setApprovalForAll, createAuction } from '../services/blockchain';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineLightningBolt } from 'react-icons/hi';

export default function CreateAuction() {
    const { account, isConnected } = useWallet();
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        tokenId: '',
        startingPrice: '10',
        duration: '5',
    });

    useEffect(() => {
        async function load() {
            if (!account) return;
            try {
                const owned = await getOwnedTokens(account);
                setTokens(owned);
                if (owned.length > 0) setForm(prev => ({ ...prev, tokenId: owned[0].tokenId }));
            } catch { }
            setLoading(false);
        }
        load();
    }, [account]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.tokenId || !form.startingPrice || !form.duration) {
            toast.error('Please fill all fields');
            return;
        }
        setSubmitting(true);
        try {
            // Step 1: Approve
            toast.loading('Approving NFT transfer...', { id: 'auction' });
            await setApprovalForAll();
            toast.loading('Creating auction...', { id: 'auction' });

            // Step 2: Create
            const durationSeconds = parseInt(form.duration) * 60;
            const { tx } = await createAuction(form.tokenId, form.startingPrice, durationSeconds);

            toast.success(
                <div>
                    <p className="font-semibold">Auction created!</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">Tx: {tx.hash.slice(0, 14)}...</p>
                </div>,
                { id: 'auction' }
            );
        } catch (err) {
            const msg = err.reason || err.message || 'Failed';
            toast.error(msg.includes('user rejected') ? 'Transaction rejected' : msg, { id: 'auction' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="text-center py-20">
                <p className="text-text-muted text-lg">Connect your wallet to create an auction</p>
            </div>
        );
    }

    if (loading) return <LoadingSpinner text="Loading your NFTs..." />;

    return (
        <div className="max-w-xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center text-white">
                    <HiOutlineLightningBolt size={20} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text">Create Auction</h1>
                    <p className="text-text-muted text-sm">Auction your carbon credit NFTs</p>
                </div>
            </div>

            {tokens.length === 0 ? (
                <div className="glass-card p-8 text-center">
                    <p className="text-text-muted">You don't own any NFTs. <a href="/my-credits" className="text-primary hover:underline">Mint one first →</a></p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Select NFT</label>
                        <select
                            value={form.tokenId}
                            onChange={e => setForm(prev => ({ ...prev, tokenId: e.target.value }))}
                            className="input-field"
                        >
                            {tokens.map(t => (
                                <option key={t.tokenId} value={t.tokenId}>
                                    Token #{t.tokenId}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Starting Price (ETH)</label>
                        <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            value={form.startingPrice}
                            onChange={e => setForm(prev => ({ ...prev, startingPrice: e.target.value }))}
                            className="input-field"
                            placeholder="1.0"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Duration (minutes)</label>
                        <input
                            type="number"
                            min="1"
                            value={form.duration}
                            onChange={e => setForm(prev => ({ ...prev, duration: e.target.value }))}
                            className="input-field"
                            placeholder="5"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full py-3 text-base" disabled={submitting}>
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                Processing...
                            </span>
                        ) : 'Create Auction'}
                    </button>
                </form>
            )}
        </div>
    );
}
