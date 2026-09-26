import { useState, type ReactNode } from 'react';
import { Compass, ExternalLink, LayoutGrid, Menu, Plus, UserRound, Wallet, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { shortAddress } from '@/lib/dha-contract';
import { useWallet } from '@/hooks/use-wallet';

export function BrandMark() {
  return <span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full border border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-[hsl(var(--primary))]"><span className="h-2.5 w-2.5 rounded-full border-2 border-[hsl(var(--primary))]" /></span><span className="font-mono-ui text-[11px] font-bold tracking-[.22em]">DHA</span></span>;
}

function WalletButton() {
  const { address, isConnecting, connect, disconnect, isSepolia, switchNetwork, hasProvider, error } = useWallet();
  const [open, setOpen] = useState(false);
  if (!address) return <button data-testid="button-connect-wallet" onClick={() => void connect()} disabled={isConnecting} className="group flex items-center gap-2 rounded-full border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:bg-[hsl(var(--foreground))] disabled:opacity-60"><Wallet className="h-4 w-4 transition group-hover:rotate-[-8deg]" />{isConnecting ? 'Connecting…' : hasProvider ? 'Connect wallet' : 'Install wallet'}</button>;
  return <div className="relative">
    <button data-testid="button-wallet-menu" onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm font-semibold transition hover:border-[hsl(var(--accent))]"><span className={`h-2 w-2 rounded-full ${isSepolia ? 'bg-emerald-600' : 'bg-amber-600'}`} />{shortAddress(address)}<span className="text-[hsl(var(--muted-foreground))]">⌄</span></button>
    {open && <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-xl">
      <p className="font-mono-ui mb-2 text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Connected wallet</p>
      <p className="mb-3 truncate text-sm">{address}</p>
      {!isSepolia && <button data-testid="button-switch-sepolia" onClick={() => void switchNetwork()} className="mb-2 flex w-full items-center justify-between rounded-xl bg-[hsl(var(--accent))] px-3 py-2 text-left text-xs font-bold">Switch to Sepolia <ExternalLink className="h-3.5 w-3.5" /></button>}
      <button data-testid="button-disconnect-wallet" onClick={() => { disconnect(); setOpen(false); }} className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-left text-xs font-semibold transition hover:bg-[hsl(var(--muted))]">Disconnect</button>
      {error && <p className="mt-2 text-xs text-[hsl(var(--destructive))]">{error}</p>}
    </div>}
  </div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [{ href: '/', label: 'Registry', icon: LayoutGrid }, { href: '/explore', label: 'Explore plots', icon: Compass }, { href: '/mint', label: 'Mint a plot', icon: Plus }, { href: '/profile', label: 'My collection', icon: UserRound }];
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[74px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" data-testid="link-brand" className="text-[hsl(var(--foreground))]"><BrandMark /></Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} data-testid={`link-${label.toLowerCase().replaceAll(' ', '-')}`} className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${location === href ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'}`}><Icon className="h-4 w-4 transition group-hover:-translate-y-0.5" />{label}</Link>)}</nav>
        <div className="flex items-center gap-2"><WalletButton /><button data-testid="button-open-mobile-nav" onClick={() => setMobileOpen(true)} className="rounded-full border border-[hsl(var(--border))] p-2.5 md:hidden"><Menu className="h-4 w-4" /></button></div>
      </div>
    </header>
    {mobileOpen && <div className="fixed inset-0 z-50 bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] md:hidden"><div className="flex items-center justify-between"><BrandMark /><button data-testid="button-close-mobile-nav" onClick={() => setMobileOpen(false)} className="rounded-full border border-white/20 p-2"><X className="h-5 w-5" /></button></div><nav className="mt-20 grid gap-5">{links.map(({ href, label, icon: Icon }) => <Link key={href} onClick={() => setMobileOpen(false)} href={href} data-testid={`mobile-link-${label.toLowerCase().replaceAll(' ', '-')}`} className="flex items-center gap-4 text-3xl font-display"><Icon className="h-6 w-6 text-[hsl(var(--accent))]" />{label}</Link>)}</nav><p className="absolute bottom-8 font-mono-ui text-[10px] uppercase tracking-[.2em] opacity-60">A considered place to learn ownership</p></div>}
    <main>{children}</main>
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-5 px-5 py-8 sm:flex-row sm:items-center sm:px-8 lg:px-12"><BrandMark /><p className="max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">Digital Housing Assets is a learning registry for on-chain ownership. No auctions. No invented activity.</p><a data-testid="link-sepolia-explorer-footer" href="https://sepolia.etherscan.io" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--primary))] hover:text-[hsl(var(--accent))]">Sepolia explorer <ExternalLink className="h-3.5 w-3.5" /></a></div></footer>
  </div>;
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <div className="animate-rise mb-10 max-w-3xl"><p className="font-mono-ui mb-4 text-[10px] uppercase tracking-[.22em] text-[hsl(var(--accent-foreground))]">{eyebrow}</p><h1 className="text-balance font-display text-5xl leading-[.95] text-[hsl(var(--primary))] sm:text-7xl">{title}</h1>{children && <div className="mt-5 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{children}</div>}</div>;
}

export function ContractNotice({ compact = false }: { compact?: boolean }) {
  return <div className={`flex ${compact ? 'items-center' : 'items-start'} gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4`}><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[hsl(var(--accent))] text-xs text-[hsl(var(--accent-foreground))]">i</span><div><p className="text-sm font-semibold">Registry contract unavailable</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{compact ? 'Connect a configured deployment to read live plots.' : 'The interface is ready, but no contract address has been supplied for this deployment. Nothing below is simulated.'}</p></div></div>;
}