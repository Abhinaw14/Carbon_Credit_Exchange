import { useEffect, useState } from 'react';
import { getPendingCredits, approveCredit, rejectCredit, getAllCredits, getAuctions } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineShieldCheck, HiOutlineGlobe, HiOutlineCube, HiOutlineLightningBolt, HiCheck, HiX } from 'react-icons/hi';

export default function AdminPanel() {
    const [pending, setPending] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [rejectId, setRejectId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const fetchData = async () => {
        try {
            const [pendingRes, creditsRes, auctionsRes] = await Promise.all([
                getPendingCredits(),
                getAllCredits(),
                getAuctions(),
            ]);
            setPending(pendingRes.data || []);
            const creds = creditsRes.data || [];
            const aucs = auctionsRes.data || [];
            setStats({
                total: creds.length,
                approved: creds.filter(c => c.status === 'APPROVED').length,
                rejected: creds.filter(c => c.status === 'REJECTED').length,
                auctions: aucs.length,
            });
        } catch {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleApprove = async (id) => {
        setActionId(id);
        try {
            const res = await approveCredit(id);
            if (res.success) {
                toast.success('Credit approved!');
                fetchData();
            } else {
                toast.error(res.error || 'Approval failed');
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionId(null);
        }
    };

    const handleReject = async (id) => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }
        setActionId(id);
        try {
            const res = await rejectCredit(id, rejectReason);
            if (res.success) {
                toast.success('Credit rejected');
                setRejectId(null);
                setRejectReason('');
                fetchData();
            } else {
                toast.error(res.error || 'Rejection failed');
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionId(null);
        }
    };

    if (loading) return <LoadingSpinner text="Loading admin panel..." />;

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center text-warning">
                    <HiOutlineShieldCheck size={20} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text">Admin Panel</h1>
                    <p className="text-text-muted text-sm">Manage submissions and view platform stats</p>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard icon={<HiOutlineGlobe />} label="Total Credits" value={stats.total} color="accent" />
                    <StatsCard icon={<HiOutlineCube />} label="Approved" value={stats.approved} color="success" />
                    <StatsCard icon={<HiX />} label="Rejected" value={stats.rejected} color="error" />
                    <StatsCard icon={<HiOutlineLightningBolt />} label="Auctions" value={stats.auctions} color="primary" />
                </div>
            )}

            {/* Pending */}
            <h2 className="text-lg font-semibold text-text mb-4">Pending Submissions ({pending.length})</h2>

            {pending.length === 0 ? (
                <div className="glass-card p-8 text-center">
                    <p className="text-text-muted">No pending submissions to review 🎉</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pending.map(credit => (
                        <div key={credit._id} className="glass-card p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-text">{credit.metadata?.projectName}</h3>
                                        <StatusBadge status={credit.status} />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-text-muted">
                                        <p>📍 {credit.metadata?.location}</p>
                                        <p>🌿 {credit.metadata?.amount} t</p>
                                        <p>📅 {credit.metadata?.vintage}</p>
                                        <p className="font-mono text-xs">👤 {credit.producer?.slice(0, 10)}...</p>
                                    </div>
                                    {credit.documents?.length > 0 && (
                                        <p className="text-xs text-accent mt-1">
                                            📎 <a href={credit.documents[0]} target="_blank" rel="noopener noreferrer" className="hover:underline">{credit.documents[0].slice(0, 40)}...</a>
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {rejectId === credit._id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={rejectReason}
                                                onChange={e => setRejectReason(e.target.value)}
                                                placeholder="Rejection reason..."
                                                className="input-field text-sm !py-2 !px-3 w-48"
                                            />
                                            <button
                                                onClick={() => handleReject(credit._id)}
                                                disabled={actionId === credit._id}
                                                className="btn-danger text-sm !py-2"
                                            >
                                                Confirm
                                            </button>
                                            <button onClick={() => { setRejectId(null); setRejectReason(''); }} className="text-text-muted hover:text-text text-sm">
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleApprove(credit._id)}
                                                disabled={actionId === credit._id}
                                                className="btn-primary text-sm !py-2"
                                            >
                                                <HiCheck size={16} /> Approve
                                            </button>
                                            <button
                                                onClick={() => setRejectId(credit._id)}
                                                className="btn-danger text-sm !py-2"
                                            >
                                                <HiX size={16} /> Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
