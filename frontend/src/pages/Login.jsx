import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineLogin } from 'react-icons/hi';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const user = await login(form.username, form.password);
            toast.success(`Welcome back, ${user.displayName}!`);
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
                    <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center text-white mx-auto mb-4">
                        <HiOutlineLogin size={28} />
                    </div>
                    <h1 className="text-3xl font-bold text-text">Welcome Back</h1>
                    <p className="text-text-muted mt-2">Login to Carbon Credit Exchange</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Username</label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                            className="input-field"
                            placeholder="Your username"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1.5">Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                            className="input-field"
                            placeholder="Your password"
                            required
                        />
                    </div>

                    <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base">
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                Logging in...
                            </span>
                        ) : 'Login'}
                    </button>

                    <p className="text-center text-text-muted text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary hover:underline font-medium">Register</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
