import { useCallback, useEffect, useState } from 'react';
import { getProvider, getWalletState, requestWallet, SEPOLIA_CHAIN_ID, switchToSepolia } from '@/lib/dha-contract';

export function useWallet() {
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try { const state = await getWalletState(); setAddress(state.address); setChainId(state.chainId); } catch { setAddress(''); }
  }, []);
  useEffect(() => {
    void refresh();
    const provider = getProvider();
    if (!provider?.on) return;
    const accounts = (...args: unknown[]) => { setAddress((args[0] as string[] | undefined)?.[0] || ''); };
    const chain = (...args: unknown[]) => setChainId(String(args[0] || ''));
    provider.on('accountsChanged', accounts); provider.on('chainChanged', chain);
    return () => { provider.removeListener?.('accountsChanged', accounts); provider.removeListener?.('chainChanged', chain); };
  }, [refresh]);
  const connect = useCallback(async () => {
    setIsConnecting(true); setError('');
    try { const state = await requestWallet(); setAddress(state.address); setChainId(state.chainId); } catch (e) { setError(e instanceof Error ? e.message : 'Wallet connection was cancelled.'); } finally { setIsConnecting(false); }
  }, []);
  const disconnect = useCallback(() => { setAddress(''); setChainId(''); }, []);
  const switchNetwork = useCallback(async () => { try { await switchToSepolia(); await refresh(); } catch (e) { setError(e instanceof Error ? e.message : 'Network switch failed.'); } }, [refresh]);
  return { address, chainId, isConnecting, error, connect, disconnect, switchNetwork, isSepolia: chainId.toLowerCase() === SEPOLIA_CHAIN_ID.toLowerCase(), hasProvider: Boolean(getProvider()) };
}