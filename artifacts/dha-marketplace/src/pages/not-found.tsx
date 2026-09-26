import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return <div className="page-grid flex min-h-[100dvh] items-center justify-center bg-[hsl(var(--background))] px-5"><div className="max-w-lg"><p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent-foreground))]">DHA / field note 404</p><h1 className="mt-5 font-display text-7xl leading-[.85] text-[hsl(var(--primary))]">This parcel<br /><em>is unmarked.</em></h1><p className="mt-6 text-sm leading-6 text-[hsl(var(--muted-foreground))]">The page you requested is not part of the current registry.</p><Link href="/" data-testid="link-return-registry" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]"><ArrowLeft className="h-4 w-4" />Return to registry</Link></div></div>;
}
