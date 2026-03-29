import { useWallet } from '../context/WalletContext';
import { HiOutlineStatusOnline, HiExclamation } from 'react-icons/hi';

export default function WalletButton() {
    const { account, isConnected, isConnecting, isWrongNetwork, connectWallet, disconnectWallet, chainId } = useWallet();

    const shortAddr = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '';

    if (isConnecting) {
        return (
            <button disabled className="btn-primary opacity-70 text-sm">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Connecting...
            </button>
        );
    }

    if (!isConnected) {
        return (
            <button onClick={connectWallet} className="btn-primary text-sm">
                <HiOutlineStatusOnline size={16} />
                Connect Wallet
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {isWrongNetwork && (
                <span className="flex items-center gap-1 text-xs text-warning bg-warning/10 px-2 py-1 rounded-lg">
                    <HiExclamation size={14} />
                    Wrong Network
                </span>
            )}
            <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-xl !border-primary/20 cursor-default">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-text">{shortAddr}</span>
            </div>
            <button onClick={disconnectWallet} className="text-xs text-text-muted hover:text-error transition-colors">
                ✕
            </button>
        </div>
    );
}
