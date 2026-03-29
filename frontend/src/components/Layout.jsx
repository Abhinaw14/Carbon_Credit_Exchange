import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';
import { useWallet } from '../context/WalletContext';

export default function Layout() {
    const { isWrongNetwork } = useWallet();

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            {isWrongNetwork && (
                <div className="bg-warning/15 border-b border-warning/30 text-warning text-center text-sm py-2 px-4">
                    ⚠️ You are connected to the wrong network. Please switch to <strong>Hardhat Local (Chain ID: 31337)</strong>
                </div>
            )}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
                <Outlet />
            </main>
            <footer className="text-center text-text-muted text-xs py-6 border-t border-border">
                © 2026 CarbonExchange · Powered by Ethereum · Blockchain-Verified Carbon Credits
            </footer>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 5000,
                    style: {
                        background: '#1E293B',
                        color: '#F8FAFC',
                        border: '1px solid #334155',
                        borderRadius: '0.75rem',
                    },
                    success: { iconTheme: { primary: '#84CC16', secondary: '#0F172A' } },
                    error: { iconTheme: { primary: '#F43F5E', secondary: '#0F172A' } },
                }}
            />
        </div>
    );
}
