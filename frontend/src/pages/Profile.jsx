import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import toast from 'react-hot-toast';
import { HiOutlinePencil, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

export default function Profile() {
    const { user, updateProfile, linkWallet } = useAuth();
    const { account, isConnected, connectWallet } = useWallet();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        displayName: user?.displayName || '',
        bio: user?.bio || '',
    });
    const [saving, setSaving] = useState(false);
    const [linking, setLinking] = useState(false);

    const initials = (user?.displayName || user?.username || '??')
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile(form);
            toast.success('Profile updated!');
            setEditing(false);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setForm({ displayName: user?.displayName || '', bio: user?.bio || '' });
        setEditing(false);
    };

    const handleLinkWallet = async () => {
        setLinking(true);
        try {
            let walletAddr = account;
            if (!walletAddr) {
                walletAddr = await connectWallet();
                if (!walletAddr) throw new Error('Wallet connection cancelled');
            }
            await linkWallet(walletAddr);
            toast.success('Wallet linked successfully!');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLinking(false);
        }
    };

    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

    const handleColorChange = async (color) => {
        try {
            await updateProfile({ profileColor: color });
            toast.success('Avatar color updated!');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            {/* Profile Header */}
            <div className="glass-card p-8 mb-6">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg"
                        style={{ backgroundColor: user.profileColor || '#10b981' }}
                    >
                        {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-text truncate">{user.displayName || user.username}</h1>
                            <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${user.role === 'ADMIN'
                                ? 'bg-warning/15 text-warning'
                                : 'bg-primary/15 text-primary'
                                }`}>
                                {user.role === 'ADMIN' ? '👑 ADMIN' : 'USER'}
                            </span>
                        </div>
                        <p className="text-text-muted text-sm">@{user.username}</p>
                        {user.bio && <p className="text-text-muted text-sm mt-2">{user.bio}</p>}
                        <p className="text-text-muted text-xs mt-2">
                            Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                    </div>

                    {!editing && (
                        <button onClick={() => setEditing(true)} className="btn-primary text-sm px-4 py-2 shrink-0">
                            <HiOutlinePencil className="inline mr-1" /> Edit
                        </button>
                    )}
                </div>
            </div>

            {/* Edit Form */}
            {editing && (
                <div className="glass-card p-6 mb-6 animate-fade-in">
                    <h2 className="text-lg font-semibold text-text mb-4">Edit Profile</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">Display Name</label>
                            <input
                                type="text"
                                value={form.displayName}
                                onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
                                className="input-field"
                                maxLength={50}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">Bio</label>
                            <textarea
                                value={form.bio}
                                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                                className="input-field resize-none"
                                rows={3}
                                maxLength={200}
                                placeholder="Tell us about yourself..."
                            />
                            <p className="text-text-muted text-xs mt-1">{form.bio.length}/200 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Avatar Color</label>
                            <div className="flex gap-2">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => handleColorChange(c)}
                                        className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                                        style={{
                                            backgroundColor: c,
                                            outline: user.profileColor === c ? '2px solid white' : 'none',
                                            outlineOffset: '2px'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2">
                                {saving ? 'Saving...' : <><HiOutlineCheck className="inline mr-1" /> Save</>}
                            </button>
                            <button onClick={handleCancel} className="px-6 py-2 rounded-lg bg-white/5 text-text-muted hover:text-text transition-colors">
                                <HiOutlineX className="inline mr-1" /> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Wallet Section */}
            <div className="glass-card p-6 mb-6">
                <h2 className="text-lg font-semibold text-text mb-4">🔗 Linked Wallet</h2>
                {user.walletAddress ? (
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                        <code className="text-text text-sm bg-white/5 px-3 py-1.5 rounded-lg">
                            {user.walletAddress}
                        </code>
                    </div>
                ) : (
                    <div>
                        <p className="text-text-muted text-sm mb-3">
                            Link your MetaMask wallet to submit credits, mint NFTs, and create auctions.
                        </p>
                        <button onClick={handleLinkWallet} disabled={linking} className="btn-primary text-sm px-4 py-2">
                            {linking ? 'Linking...' : '🦊 Link MetaMask Wallet'}
                        </button>
                    </div>
                )}
            </div>

            {/* Account Details */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-text mb-4">Account Details</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-text-muted">Username</span>
                        <span className="text-text font-mono">@{user.username}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-muted">Role</span>
                        <span className="text-text">{user.role}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-muted">User ID</span>
                        <span className="text-text font-mono text-xs">{user.id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
