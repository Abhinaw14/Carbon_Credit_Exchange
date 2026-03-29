import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { HiOutlineMenu, HiX } from 'react-icons/hi';
import { useState, useRef, useEffect } from 'react';
import WalletButton from './WalletButton';

const baseLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/submit', label: 'Submit Credit' },
    { path: '/my-credits', label: 'My Credits' },
    { path: '/auctions', label: 'Auctions' },
    { path: '/architecture', label: 'Architecture' },
];

export default function Navbar() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { isConnected } = useWallet();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Build links — Admin tab only for ADMIN
    const navLinks = isAdmin
        ? [...baseLinks.slice(0, 4), { path: '/admin', label: 'Admin' }, ...baseLinks.slice(4)]
        : baseLinks;

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const initials = isAuthenticated
        ? (user?.displayName || user?.username || '??').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '??';

    return (
        <nav className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                            C
                        </div>
                        <span className="font-bold text-lg text-text hidden sm:block">
                            Carbon<span className="text-primary">Exchange</span>
                        </span>
                    </Link>

                    {/* Desktop Links — only show if authenticated */}
                    {isAuthenticated && (
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === link.path
                                        ? 'bg-primary/15 text-primary'
                                        : 'text-text-muted hover:text-text hover:bg-white/5'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {/* Wallet button */}
                                <WalletButton />

                                {/* Role badge */}
                                <span className={`hidden sm:inline px-2.5 py-1 rounded-md text-xs font-semibold ${isAdmin ? 'bg-warning/15 text-warning' : 'bg-primary/15 text-primary'}`}>
                                    {isAdmin ? '👑 ADMIN' : 'USER'}
                                </span>

                                {/* Profile Avatar Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold hover:scale-110 transition-transform"
                                        style={{ backgroundColor: user?.profileColor || '#10b981' }}
                                    >
                                        {initials}
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 glass-card p-2 animate-fade-in z-50">
                                            <div className="px-3 py-2 border-b border-white/10 mb-1">
                                                <p className="text-text font-semibold text-sm truncate">{user?.displayName}</p>
                                                <p className="text-text-muted text-xs">@{user?.username}</p>
                                            </div>
                                            <Link
                                                to="/profile"
                                                onClick={() => setProfileOpen(false)}
                                                className="block px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                👤 My Profile
                                            </Link>
                                            <button
                                                onClick={() => { logout(); setProfileOpen(false); }}
                                                className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
                                            >
                                                🚪 Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                                    Register
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        {isAuthenticated && (
                            <button
                                className="md:hidden text-text-muted hover:text-text p-2"
                                onClick={() => setMobileOpen(!mobileOpen)}
                            >
                                {mobileOpen ? <HiX size={22} /> : <HiOutlineMenu size={22} />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && isAuthenticated && (
                    <div className="md:hidden pb-4 animate-fade-in">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setMobileOpen(false)}
                                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${location.pathname === link.path
                                    ? 'bg-primary/15 text-primary'
                                    : 'text-text-muted hover:text-text hover:bg-white/5'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text hover:bg-white/5">
                            👤 Profile
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
