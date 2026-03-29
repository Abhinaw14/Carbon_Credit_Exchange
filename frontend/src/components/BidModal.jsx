import { useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { placeBid } from '../services/blockchain';

export default function BidModal({ auction, onClose, onBidPlaced }) {
    const [bidAmount, setBidAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const currentBidEth = auction.highestBid !== '0'
        ? ethers.formatEther(auction.highestBid)
        : '0';

    const handleBid = async (e) => {
        e.preventDefault();
        if (!bidAmount || parseFloat(bidAmount) <= parseFloat(currentBidEth)) {
            toast.error(`Bid must be higher than ${currentBidEth} ETH`);
            return;
        }
        setLoading(true);
        try {
            const { tx } = await placeBid(auction.auctionId, bidAmount);
            toast.success(
                <div>
                    <p className="font-semibold">Bid placed successfully!</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                        Tx: {tx.hash.slice(0, 14)}...
                    </p>
                </div>
            );
            onBidPlaced?.();
            onClose();
        } catch (err) {
            const msg = err.reason || err.message || 'Transaction failed';
            if (msg.includes('user rejected')) {
                toast.error('Transaction rejected by user');
            } else if (msg.includes('insufficient funds')) {
                toast.error('Insufficient funds for this bid');
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="glass-card p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-text mb-1">Place a Bid</h3>
                <p className="text-text-muted text-sm mb-5">
                    Auction #{auction.auctionId} · Token #{auction.tokenId}
                </p>

                <div className="bg-bg-dark/50 rounded-lg p-3 mb-5">
                    <p className="text-xs text-text-muted">Current Highest Bid</p>
                    <p className="text-xl font-bold text-primary">{currentBidEth} ETH</p>
                </div>

                <form onSubmit={handleBid}>
                    <label className="block text-sm font-medium text-text-muted mb-1.5">Your Bid (ETH)</label>
                    <input
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder={`More than ${currentBidEth}`}
                        value={bidAmount}
                        onChange={e => setBidAmount(e.target.value)}
                        className="input-field mb-5"
                        required
                        disabled={loading}
                    />

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary flex-1" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                    Confirming...
                                </span>
                            ) : (
                                'Place Bid'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
