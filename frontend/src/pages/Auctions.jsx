import { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getAuctions } from '../services/api';
import { finalizeAuction } from '../services/blockchain';
import { ethers } from 'ethers';
import StatusBadge from '../components/StatusBadge';
import CountdownTimer from '../components/CountdownTimer';
import BidModal from '../components/BidModal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineLightningBolt } from 'react-icons/hi';

export default function Auctions() {
    const { account } = useWallet();
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [bidAuction, setBidAuction] = useState(null);
    const [finalizingId, setFinalizingId] = useState(null);

    const fetchAuctions = async () => {
        try {
            const params = filter !== 'ALL' ? { status: filter } : {};
            const res = await getAuctions(params);
            setAuctions(res.data || []);
        } catch {
            toast.error('Failed to load auctions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setLoading(true); fetchAuctions(); }, [filter]);

    // Auto-refresh every 15s
    useEffect(() => {
        const interval = setInterval(fetchAuctions, 15000);
        return () => clearInterval(interval);
    }, [filter]);

    const handleFinalize = async (auctionId) => {
        setFinalizingId(auctionId);
        try {
            const { tx } = await finalizeAuction(auctionId);
            toast.success(
                <div>
                    <p className="font-semibold">Auction finalized!</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">Tx: {tx.hash.slice(0, 14)}...</p>
                </div>
            );
            fetchAuctions();
        } catch (err) {
            const msg = err.reason || err.message || 'Failed';
            toast.error(msg.includes('user rejected') ? 'Transaction rejected' : msg);
        } finally {
            setFinalizingId(null);
        }
    };

    const isEnded = (auction) => {
        return auction.endTime && auction.endTime * 1000 < Date.now();
    };

    const isSeller = (auction) => {
        return account && auction.seller?.toLowerCase() === account.toLowerCase();
    };

    if (loading) return <LoadingSpinner text="Loading auctions..." />;

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center text-white">
                        <HiOutlineLightningBolt size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text">Auctions</h1>
                        <p className="text-text-muted text-sm">Browse and bid on carbon credit NFTs</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {['ALL', 'ACTIVE', 'ENDED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f
                                    ? 'bg-primary/15 text-primary border border-primary/30'
                                    : 'text-text-muted border border-border hover:border-primary/30 hover:text-text'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {auctions.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-text-muted text-lg">No {filter !== 'ALL' ? filter.toLowerCase() : ''} auctions found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {auctions.map(auction => {
                        const highBidEth = auction.highestBid !== '0'
                            ? ethers.formatEther(auction.highestBid)
                            : '0';
                        const ended = isEnded(auction);
                        const seller = isSeller(auction);

                        return (
                            <div key={auction._id} className="glass-card p-5 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold">
                                            #{auction.tokenId}
                                        </div>
                                        <span className="font-semibold text-text">Auction #{auction.auctionId}</span>
                                    </div>
                                    <StatusBadge status={auction.finalized ? 'ENDED' : ended ? 'ENDED' : 'ACTIVE'} />
                                </div>

                                <div className="space-y-2 text-sm text-text-muted flex-1">
                                    <p>Seller: <span className="font-mono text-xs">{auction.seller?.slice(0, 8)}...{auction.seller?.slice(-4)}</span></p>
                                    <p>Highest Bid: <span className="text-primary font-semibold">{highBidEth} ETH</span></p>
                                    {auction.highestBidder && auction.highestBidder !== '0x0000000000000000000000000000000000000000' && (
                                        <p>Leader: <span className="font-mono text-xs">{auction.highestBidder?.slice(0, 8)}...</span></p>
                                    )}
                                    <p>Bids: {auction.bids?.length || 0}</p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border">
                                    {!ended && auction.endTime && (
                                        <div className="mb-3">
                                            <p className="text-xs text-text-muted mb-1">Ends in:</p>
                                            <CountdownTimer endTime={auction.endTime} />
                                        </div>
                                    )}

                                    {!ended && !auction.finalized && (
                                        <button
                                            onClick={() => setBidAuction(auction)}
                                            className="btn-primary w-full text-sm"
                                        >
                                            Place Bid
                                        </button>
                                    )}

                                    {ended && !auction.finalized && seller && (
                                        <button
                                            onClick={() => handleFinalize(auction.auctionId)}
                                            disabled={finalizingId === auction.auctionId}
                                            className="btn-secondary w-full text-sm"
                                        >
                                            {finalizingId === auction.auctionId ? 'Finalizing...' : 'Finalize Auction'}
                                        </button>
                                    )}

                                    {auction.finalized && (
                                        <div className="text-center">
                                            <p className="text-success font-semibold text-sm">✓ Settled</p>
                                            {auction.winner && (
                                                <p className="text-xs text-text-muted mt-1">Winner: {auction.winner?.slice(0, 8)}...</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {bidAuction && (
                <BidModal
                    auction={bidAuction}
                    onClose={() => setBidAuction(null)}
                    onBidPlaced={fetchAuctions}
                />
            )}
        </div>
    );
}
