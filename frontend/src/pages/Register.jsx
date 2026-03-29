import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineUserAdd } from 'react-icons/hi';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', displayName: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setSubmitting(true);
        try {
            const user = await register(form.username, form.password, form.displayName || form.username);
            toast.success(`Welcome, ${user.displayName}! ${user.role === 'ADMIN' ? '👑 You are the Admin!' : ''}`);
            navigate('/');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white mx-auto mb-4">
                        <HiOutlineUserAdd size={28} />
                    </div>
                    <h1 className="text-3xl font-bold text-text">Create Account</h1>
                    <p className="text-text-muted mt-2">Join the Carbon Credit Exchange</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Username</label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                            className="input-field"
                            placeholder="e.g. john_doe"
                            minLength={3}
                            maxLength={30}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Display Name</label>
                        <input
                            type="text"
                            value={form.displayName}
                            onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
                            className="input-field"
                            placeholder="John Doe (optional)"
                            maxLength={50}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                            className="input-field"
                            placeholder="Min 6 characters"
                            minLength={6}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Confirm Password</label>
                        <input
                            type="password"
                            value={form.confirmPassword}
                            onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                            className="input-field"
                            placeholder="Repeat password"
                            minLength={6}
                            required
                        />
                    </div>

                    <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base">
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                Creating account...
                            </span>
                        ) : 'Create Account'}
                    </button>

                    <p className="text-center text-text-muted text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium">Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
