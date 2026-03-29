import { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getAllCredits, markCreditMinted } from '../services/api';
import { mintCarbonCredit, getOwnedTokens } from '../services/blockchain';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineCube, HiOutlineSparkles } from 'react-icons/hi';

export default function MyCredits() {
    const { account, isConnected } = useWallet();
    const [credits, setCredits] = useState([]);
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mintingId, setMintingId] = useState(null);

    const fetchData = async () => {
        if (!account) return;
        setLoading(true);
        try {
            const [creditsRes, ownedTokens] = await Promise.all([
                getAllCredits({ producer: account }),
                getOwnedTokens(account).catch(() => []),
            ]);
            setCredits(creditsRes.data || []);
            setTokens(ownedTokens);
        } catch {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [account]);

    const handleMint = async (credit) => {
        setMintingId(credit._id);
        try {
            const metadataURI = `ipfs://carbon-credit-${credit._id}`;
            const { tokenId, tx } = await mintCarbonCredit(account, metadataURI);

            // Mark as minted in backend so it can't be minted again
            await markCreditMinted(credit._id, tokenId).catch(() => { });

            toast.success(
                <div>
                    <p className="font-semibold">NFT Minted! Token #{tokenId}</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">Tx: {tx.hash.slice(0, 14)}...</p>
                </div>
            );
            fetchData();
        } catch (err) {
            const msg = err.reason || err.message || 'Minting failed';
            if (msg.includes('user rejected')) {
                toast.error('Transaction rejected');
            } else {
                toast.error(msg);
            }
        } finally {
            setMintingId(null);
        }
    };

    if (!isConnected) {
        return (
            <div className="text-center py-20">
                <p className="text-text-muted text-lg">Connect your wallet to view your credits</p>
            </div>
        );
    }

    if (loading) return <LoadingSpinner text="Loading your credits..." />;

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white">
                    <HiOutlineCube size={20} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text">My Credits</h1>
                    <p className="text-text-muted text-sm">Your submissions and minted NFTs</p>
                </div>
            </div>

            {/* Submissions */}
            <h2 className="text-lg font-semibold text-text mb-3">Submissions</h2>
            {credits.length === 0 ? (
                <div className="glass-card p-8 text-center mb-8">
                    <p className="text-text-muted">No submissions yet. <a href="/submit" className="text-primary hover:underline">Submit your first credit →</a></p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {credits.map(credit => {
                        const canMint = credit.status === 'APPROVED' && !credit.minted;
                        const isMinted = credit.minted;

                        return (
                            <div key={credit._id} className="glass-card p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-text">{credit.metadata?.projectName}</h3>
                                    <div className="flex items-center gap-2">
                                        {isMinted && (
                                            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-accent/15 text-accent">
                                                MINTED ✓
                                            </span>
                                        )}
                                        <StatusBadge status={credit.status} />
                                    </div>
                                </div>
                                <div className="space-y-1 text-sm text-text-muted mb-4">
                                    <p>📍 {credit.metadata?.location}</p>
                                    <p>🌿 {credit.metadata?.amount} tonnes CO₂</p>
                                    <p>📅 Vintage: {credit.metadata?.vintage}</p>
                                    {credit.approvalDate && (
                                        <p>✅ Approved: {new Date(credit.approvalDate).toLocaleDateString()}</p>
                                    )}
                                    {credit.blockchainTokenId && (
                                        <p>🔗 Token ID: <span className="font-mono">#{credit.blockchainTokenId}</span></p>
                                    )}
                                </div>

                                {canMint && (
                                    <button
                                        onClick={() => handleMint(credit)}
                                        disabled={mintingId === credit._id}
                                        className="btn-primary w-full text-sm"
                                    >
                                        {mintingId === credit._id ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                                Minting...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <HiOutlineSparkles /> Mint as NFT
                                            </span>
                                        )}
                                    </button>
                                )}

                                {isMinted && (
                                    <p className="text-xs text-success text-center mt-2">✓ Already minted as NFT</p>
                                )}

                                {credit.status === 'REJECTED' && credit.rejectionReason && (
                                    <p className="text-xs text-error mt-2">Reason: {credit.rejectionReason}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Owned NFTs — only shows tokens you CURRENTLY own */}
            <h2 className="text-lg font-semibold text-text mb-3">
                My NFTs <span className="text-text-muted text-sm font-normal">(currently owned)</span>
            </h2>
            {tokens.length === 0 ? (
                <div className="glass-card p-8 text-center">
                    <p className="text-text-muted">
                        {credits.some(c => c.minted)
                            ? 'All your NFTs have been auctioned or transferred.'
                            : 'No NFTs owned yet. Mint an approved credit above.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tokens.map(token => (
                        <div key={token.tokenId} className="glass-card p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center text-white font-bold">
                                    #{token.tokenId}
                                </div>
                                <div>
                                    <p className="font-semibold text-text">Carbon Credit #{token.tokenId}</p>
                                    <p className="text-xs text-text-muted font-mono">{token.uri || 'No URI'}</p>
                                </div>
                            </div>
                            <a href="/create-auction" className="text-primary text-sm hover:underline">Create Auction →</a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
