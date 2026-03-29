import { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getAllCredits, getAuctions } from '../services/api';
import StatsCard from '../components/StatsCard';
import { ShimmerCard } from '../components/LoadingSpinner';
import { HiOutlineLightningBolt, HiOutlineGlobe, HiOutlineCube, HiOutlineCurrencyDollar } from 'react-icons/hi';

export default function Dashboard() {
    const { isConnected, account } = useWallet();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [credits, auctions] = await Promise.all([
                    getAllCredits(),
                    getAuctions(),
                ]);
                const creds = credits.data || [];
                const aucs = auctions.data || [];
                setStats({
                    totalCredits: creds.length,
                    approved: creds.filter(c => c.status === 'APPROVED').length,
                    activeAuctions: aucs.filter(a => a.status === 'ACTIVE').length,
                    endedAuctions: aucs.filter(a => a.status === 'ENDED').length,
                });
            } catch {
                setStats({ totalCredits: 0, approved: 0, activeAuctions: 0, endedAuctions: 0 });
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="animate-fade-in">
            {/* Hero */}
            <div className="gradient-header rounded-2xl p-8 sm:p-12 mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                    Carbon Credit <span className="text-primary">Exchange</span>
                </h1>
                <p className="text-text-muted max-w-xl text-sm sm:text-base leading-relaxed">
                    A decentralized platform for submitting, verifying, and auctioning carbon credits.
                    Powered by Ethereum smart contracts for transparent and tamper-proof settlement.
                </p>
                {!isConnected && (
                    <p className="mt-4 text-warning text-sm">
                        🔗 Connect your wallet to get started
                    </p>
                )}
                {isConnected && (
                    <p className="mt-4 text-primary text-sm">
                        ✓ Connected as <span className="font-mono">{account?.slice(0, 8)}...</span>
                    </p>
                )}
            </div>

            {/* Stats */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map(i => <ShimmerCard key={i} />)}
                </div>
            ) : stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard icon={<HiOutlineGlobe />} label="Total Credits" value={stats.totalCredits} color="accent" />
                    <StatsCard icon={<HiOutlineCube />} label="Approved" value={stats.approved} color="success" />
                    <StatsCard icon={<HiOutlineLightningBolt />} label="Active Auctions" value={stats.activeAuctions} color="primary" />
                    <StatsCard icon={<HiOutlineCurrencyDollar />} label="Ended Auctions" value={stats.endedAuctions} color="warning" />
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <QuickAction
                    title="Submit Carbon Credit"
                    desc="Register a new carbon offset project for verification"
                    href="/submit"
                    color="primary"
                />
                <QuickAction
                    title="Browse Auctions"
                    desc="Discover and bid on verified carbon credit NFTs"
                    href="/auctions"
                    color="accent"
                />
                <QuickAction
                    title="Architecture"
                    desc="Learn how our hybrid blockchain system works"
                    href="/architecture"
                    color="secondary"
                />
            </div>
        </div>
    );
}

function QuickAction({ title, desc, href, color }) {
    return (
        <a href={href} className="glass-card p-6 group block">
            <div className={`w-10 h-10 rounded-xl bg-${color}/15 flex items-center justify-center text-${color} mb-4 text-lg group-hover:scale-110 transition-transform`}>
                →
            </div>
            <h3 className="font-semibold text-text mb-1">{title}</h3>
            <p className="text-text-muted text-sm">{desc}</p>
        </a>
    );
}
