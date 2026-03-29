import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import addresses from '../../contracts/addresses.json';

const WalletContext = createContext(null);

const EXPECTED_CHAIN_ID = addresses.chainId;

export function WalletProvider({ children }) {
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    const isWrongNetwork = chainId && chainId !== EXPECTED_CHAIN_ID;
    const isConnected = !!account;

    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            setError('MetaMask is not installed');
            return null;
        }
        setIsConnecting(true);
        setError(null);
        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await browserProvider.send('eth_requestAccounts', []);
            const network = await browserProvider.getNetwork();
            const walletSigner = await browserProvider.getSigner();

            setProvider(browserProvider);
            setSigner(walletSigner);
            setAccount(accounts[0]);
            setChainId(Number(network.chainId));
            localStorage.setItem('walletConnected', 'true');

            return accounts[0];
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnectWallet = useCallback(() => {
        setAccount(null);
        setChainId(null);
        setProvider(null);
        setSigner(null);
        localStorage.removeItem('walletConnected');
    }, []);

    // Auto-reconnect on page load
    useEffect(() => {
        const wasConnected = localStorage.getItem('walletConnected');
        if (wasConnected && window.ethereum) {
            connectWallet();
        }
    }, [connectWallet]);

    // Listen for account/chain changes
    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                disconnectWallet();
            } else {
                setAccount(accounts[0]);
            }
        };

        const handleChainChanged = (chainIdHex) => {
            setChainId(Number(chainIdHex));
            window.location.reload();
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        };
    }, [disconnectWallet]);

    const value = {
        account,
        chainId,
        provider,
        signer,
        isConnected,
        isConnecting,
        isWrongNetwork,
        error,
        expectedChainId: EXPECTED_CHAIN_ID,
        connectWallet,
        disconnectWallet,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) throw new Error('useWallet must be used within WalletProvider');
    return context;
}
