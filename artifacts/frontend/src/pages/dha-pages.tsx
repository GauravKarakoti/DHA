import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  FileText,
  LoaderCircle,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link, useParams } from 'wouter';
import { AppShell, ContractNotice, PageIntro } from '@/components/dha-shell';
import { useWallet } from '@/hooks/use-wallet';
import {
  CONTRACT_ADDRESS,
  explorerAddress,
  explorerToken,
  explorerTx,
  mintPlot,
  mintedTokenId,
  readOwnedPlots,
  readPlot,
  readTotalSupply,
  shortAddress,
  waitForTransaction,
  type PlotMetadata,
  type RegistryRead,
} from '@/lib/dha-contract';

const archiveStudies = [
  { code: 'ARCHIVE / 001', title: 'The Meridian Parcel', tone: 'bg-[#d7dfca]' },
  { code: 'ARCHIVE / 002', title: 'Northing Study', tone: 'bg-[#e1d6bd]' },
  { code: 'ARCHIVE / 003', title: 'The Quiet Boundary', tone: 'bg-[#cbd9d1]' },
];

function MapTile({
  title,
  code,
  tone = 'bg-[#d7dfca]',
  tokenId,
  image,
}: {
  title: string;
  code: string;
  tone?: string;
  tokenId?: string;
  image?: string;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition duration-500 hover:-translate-y-1 hover:border-[hsl(var(--accent))] hover:shadow-[0_18px_40px_rgba(48,75,66,.11)]">
      <div
        className={`map-art relative aspect-[1.35] overflow-hidden ${tone}`}
        style={
          image
            ? {
                backgroundImage: `url("${image}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-[hsl(var(--card))]/80 px-2.5 py-1 font-mono-ui text-[9px] tracking-[.12em] text-[hsl(var(--primary))] backdrop-blur-sm">
            {code}
          </span>
          {tokenId && (
            <span className="rounded-full bg-[hsl(var(--primary))]/90 px-2.5 py-1 font-mono-ui text-[9px] text-[hsl(var(--primary-foreground))]">
              #{tokenId}
            </span>
          )}
        </div>
        <div className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--card))]/90 text-[hsl(var(--primary))] opacity-0 backdrop-blur transition group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <div className="p-5">
        <p className="font-mono-ui text-[9px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">
          Digital parcel
        </p>
        <h3 className="mt-2 font-display text-2xl text-[hsl(var(--primary))]">
          {title}
        </h3>
      </div>
    </div>
  );
}

function LoadingTiles() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
        >
          <div className="aspect-[1.35] bg-[hsl(var(--muted))]" />
          <div className="space-y-3 p-5">
            <div className="h-2 w-20 rounded bg-[hsl(var(--muted))]" />
            <div className="h-6 w-40 rounded bg-[hsl(var(--muted))]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NetworkBanner() {
  const { address, isSepolia, switchNetwork } = useWallet();
  if (!address || isSepolia) return null;
  return (
    <div className="border-b border-amber-300/50 bg-[#f5e7c5] px-5 py-3 text-center text-xs text-[#654c1e]">
      <span className="font-semibold">Wrong network.</span> DHA reads and mints
      on Sepolia only.
      <button
        data-testid="button-switch-network-banner"
        onClick={() => void switchNetwork()}
        className="ml-2 font-bold underline underline-offset-4"
      >
        Switch network
      </button>
    </div>
  );
}

export function HomePage() {
  return (
    <AppShell>
      <NetworkBanner />
      <section className="page-grid relative overflow-hidden">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-12 lg:pb-28 lg:pt-24">
          <div className="animate-rise">
            <p className="font-mono-ui mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[.24em] text-[hsl(var(--accent-foreground))]">
              <span className="h-px w-8 bg-[hsl(var(--accent))]" />
              A digital estate registry
            </p>
            <h1 className="max-w-3xl font-display text-6xl leading-[.86] tracking-[-.02em] text-[hsl(var(--primary))] sm:text-8xl lg:text-[7.7rem]">
              Learn to own
              <br />
              <em className="text-[hsl(var(--accent-foreground))]">
                your coordinates.
              </em>
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-[hsl(var(--muted-foreground))]">
              DHA is a quiet place to discover, understand, and mint digital
              plots on-chain. Start with the map. Leave with a record.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/explore"
                data-testid="link-explore-home"
                className="group flex items-center gap-3 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:bg-[hsl(var(--foreground))]"
              >
                Browse the registry
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/mint"
                data-testid="link-mint-home"
                className="rounded-full border border-[hsl(var(--primary))] px-5 py-3 text-sm font-semibold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:bg-[hsl(var(--card))]"
              >
                How minting works
              </Link>
            </div>
          </div>
          <div className="animate-rise stagger-2 relative">
            <div className="absolute -inset-10 bg-[hsl(var(--accent))]/15 blur-3xl" />
            <div className="relative rotate-[2deg] rounded-[1.75rem] border border-[hsl(var(--primary))]/20 bg-[#cfd8c5] p-3 shadow-[0_28px_70px_rgba(48,75,66,.18)]">
              <div className="map-art aspect-[1.08] rounded-[1.25rem] border border-[hsl(var(--primary))]/20 bg-[#cfd8c5] p-5">
                <div className="flex justify-between font-mono-ui text-[9px] tracking-[.12em] text-[hsl(var(--primary))]">
                  <span>DHA / FIELD MAP</span>
                  <span>SEPOLIA</span>
                </div>
                <div className="relative mt-6 h-64 sm:h-80">
                  <div className="absolute left-[22%] top-[15%] h-28 w-40 rotate-[-12deg] border border-[hsl(var(--primary))]/50 bg-[#e8e2c9]/50" />
                  <div className="absolute bottom-[12%] right-[18%] h-32 w-44 rotate-[15deg] border border-[hsl(var(--primary))]/50 bg-[#e8e2c9]/50" />
                  <div className="absolute left-[45%] top-[42%] h-3 w-3 rounded-full bg-[hsl(var(--accent-foreground))] ring-8 ring-[hsl(var(--accent))]/30" />
                  <div className="absolute bottom-2 left-0 right-0 border-t border-[hsl(var(--primary))]/30 pt-3 font-mono-ui text-[9px] text-[hsl(var(--primary))]/70">
                    <span>41° 24′ 12.2″ N</span>
                    <span className="float-right">2° 10′ 26.5″ E</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-2 pb-1 pt-3 font-mono-ui text-[9px] uppercase tracking-[.12em] text-[hsl(var(--primary))]/70">
                <span>Registry study 00</span>
                <span>◌ live surface</span>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 shadow-lg">
              <p className="font-mono-ui text-[9px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">
                A plot is
              </p>
              <p className="font-display text-xl text-[hsl(var(--primary))]">
                a lesson + a record
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">
              The DHA approach
            </p>
            <h2 className="mt-4 max-w-sm font-display text-5xl leading-[.92] text-[hsl(var(--primary))]">
              Property records, not price charts.
            </h2>
          </div>
          <div className="grid gap-0 border-t border-[hsl(var(--border))] sm:grid-cols-3 sm:border-l">
            {[
              [ShieldCheck, 'Read first', 'Learn what a token records before you sign a transaction.'],
              [MapPin, 'See the coordinates', 'Explore plots as a living archive of metadata and provenance.'],
              [FileText, 'Keep the receipt', 'Every successful mint ends with a transaction you can verify.'],
            ].map(([Icon, title, copy]) => (
              <div key={title as string} className="border-b border-[hsl(var(--border))] p-5 sm:border-b-0 sm:border-r lg:p-8">
                <Icon className="h-5 w-5 text-[hsl(var(--accent-foreground))]" />
                <h3 className="mt-8 text-sm font-bold">{title as string}</h3>
                <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{copy as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:flex lg:items-end lg:justify-between lg:px-12 lg:py-28">
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">A small archive of ideas</p>
            <h2 className="mt-4 max-w-2xl font-display text-5xl leading-[.9] sm:text-7xl">
              The registry begins
              <br />
              <em className="text-[hsl(var(--accent))]">with attention.</em>
            </h2>
          </div>
          <Link href="/explore" data-testid="link-view-archive" className="mt-8 flex items-center gap-2 text-sm font-semibold underline decoration-[hsl(var(--accent))] decoration-2 underline-offset-8 lg:mb-2 lg:mt-0">
            View the archive <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

export function ExplorePage() {
  const [plots, setPlots] = useState<RegistryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [supply, setSupply] = useState<number | null>(null);
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const count = await readTotalSupply();
      setSupply(count);
      const ids = Array.from({ length: Math.min(count, 12) }, (_, index) => String(index + 1));
      setPlots(await Promise.all(ids.map(readPlot)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registry could not be read.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);
  return (
    <AppShell>
      <NetworkBanner />
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <PageIntro eyebrow="01 / Registry" title="Plots worth studying.">
          A gallery of live on-chain records. Each parcel is a small, legible lesson in what ownership can mean.
        </PageIntro>
        {loading && <LoadingTiles />}
        {error && (
          <div className="max-w-xl">
            <ContractNotice />
            <button data-testid="button-retry-registry" onClick={() => void load()} className="mt-4 flex items-center gap-2 rounded-full border border-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold">
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        )}
        {!loading && !error && plots.length > 0 && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">
                {supply} registered {supply === 1 ? 'plot' : 'plots'}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Sepolia registry · live read</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {plots.map((plot) => (
                <Link href={`/nft/${plot.tokenId}`} key={plot.tokenId} data-testid={`link-plot-${plot.tokenId}`}>
                  <MapTile title={plot.metadata?.name || `Plot ${plot.tokenId}`} code="LIVE / REGISTRY" tokenId={plot.tokenId} image={typeof plot.metadata?.image === 'string' ? plot.metadata.image : undefined} />
                </Link>
              ))}
            </div>
          </>
        )}
        {!loading && !error && plots.length === 0 && (
          <div className="max-w-2xl">
            <ContractNotice />
            <div className="mt-14 grid gap-5 sm:grid-cols-3">
              {archiveStudies.map((plot, index) => (
                <div key={plot.code} className="animate-rise" style={{ animationDelay: `${index * 80}ms` }}>
                  <MapTile {...plot} />
                  <p className="mt-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Archive study · not a minted token</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function TextField({ label, value, onChange, placeholder, testId, numeric = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; testId: string; numeric?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input required inputMode={numeric ? 'numeric' : undefined} data-testid={testId} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent-foreground))] focus:ring-2 focus:ring-[hsl(var(--accent))]/30" />
    </label>
  );
}

export function MintPage() {
  const { address, isSepolia, connect, switchNetwork } = useWallet();
  const [plotNumber, setPlotNumber] = useState('');
  const [blockName, setBlockName] = useState('');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [mintedId, setMintedId] = useState('');
  const preview: PlotMetadata = useMemo(
    () => ({
      name: name || `DHA Plot #${plotNumber || '—'}`,
      description: description || 'A digital plot registered through DHA.',
      image: image || undefined,
      attributes: [
        { trait_type: 'Plot Number', value: plotNumber || 'Not set' },
        { trait_type: 'Block', value: blockName || 'Not set' },
        { trait_type: 'Area', value: area ? `${area} sq yd` : 'Not set' },
        { trait_type: 'Location', value: location || 'Not set' },
      ],
    }),
    [plotNumber, blockName, area, location, name, description, image],
  );
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('');
    if (!address) { await connect(); return; }
    if (!isSepolia) { await switchNetwork(); return; }
    if (!plotNumber || !blockName || !area || !location || !name) { setStatus('Complete the plot number, block, area, location, and name before minting.'); return; }
    if (!/^[1-9]\d*$/.test(plotNumber) || !/^[1-9]\d*$/.test(area)) { setStatus('Plot number and area must be positive whole numbers.'); return; }
    try {
      setStatus('Preparing transaction…');
      const uri = `data:application/json,${encodeURIComponent(JSON.stringify(preview))}`;
      const hash = await mintPlot(uri, address, plotNumber, blockName, area, location);
      setTxHash(hash);
      setStatus('Transaction pending…');
      const receipt = await waitForTransaction(hash);
      const tokenId = mintedTokenId(receipt);
      setMintedId(tokenId);
      setStatus(tokenId ? `NFT minted successfully · Token ID #${tokenId}` : 'NFT minted successfully.');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Minting could not be completed.');
    }
  };
  return (
    <AppShell>
      <NetworkBanner />
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <PageIntro eyebrow="02 / Mint a record" title="Make a place on the map.">
          Write a small piece of metadata, preview the record, then sign only when it looks right. Your wallet is the final authority.
        </PageIntro>
        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <form onSubmit={(event) => void submit(event)} className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8">
            <div className="mb-8 flex items-center gap-3 border-b border-[hsl(var(--border))] pb-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]">01</span>
              <div><p className="text-sm font-bold">Describe your plot</p><p className="text-xs text-[hsl(var(--muted-foreground))]">Stored as token metadata and plot data</p></div>
            </div>
            <div className="mb-5 grid gap-4 sm:grid-cols-2">
              <TextField label="Plot number" value={plotNumber} onChange={setPlotNumber} placeholder="001" testId="input-plot-number" numeric />
              <TextField label="Block" value={blockName} onChange={setBlockName} placeholder="A" testId="input-plot-block" />
              <TextField label="Area · sq yd" value={area} onChange={setArea} placeholder="250" testId="input-plot-area" numeric />
              <TextField label="Location" value={location} onChange={setLocation} placeholder="DHA Digital Estate" testId="input-plot-location" />
            </div>
            <label className="mb-5 block"><span className="mb-2 block text-sm font-semibold">Plot name</span><input required data-testid="input-plot-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="For example, East Garden" className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent-foreground))] focus:ring-2 focus:ring-[hsl(var(--accent))]/30" /></label>
            <label className="mb-5 block"><span className="mb-2 block text-sm font-semibold">Description</span><textarea data-testid="input-plot-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What should a future reader understand?" rows={4} className="w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent-foreground))] focus:ring-2 focus:ring-[hsl(var(--accent))]/30" /></label>
            <label className="mb-7 block"><span className="mb-2 block text-sm font-semibold">Image URL <span className="font-normal text-[hsl(var(--muted-foreground))]">optional</span></span><input data-testid="input-plot-image" value={image} onChange={(event) => setImage(event.target.value)} placeholder="ipfs://… or a public image URL" className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-3 text-sm outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent-foreground))] focus:ring-2 focus:ring-[hsl(var(--accent))]/30" /></label>
            <button data-testid="button-mint-plot" type="submit" disabled={status === 'Preparing transaction…'} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:bg-[hsl(var(--foreground))] disabled:opacity-60">
              {!address ? <><Sparkles className="h-4 w-4" />Connect to continue</> : !isSepolia ? 'Switch to Sepolia' : status === 'Preparing transaction…' || status === 'Transaction pending…' ? <><LoaderCircle className="h-4 w-4 animate-spin" />{status === 'Transaction pending…' ? 'Confirming' : 'Preparing'}</> : 'Mint plot NFT'}
            </button>
            {status && <p data-testid="status-mint" className={`mt-4 text-center text-xs leading-5 ${status.includes('could not') || status.includes('configured') || status.includes('Complete') || status.includes('positive') ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--muted-foreground))]'}`}>{status}</p>}
            {txHash && <a data-testid="link-mint-transaction" href={explorerTx(txHash)} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-[hsl(var(--primary))] underline underline-offset-4">View transaction on Sepolia <ExternalLink className="h-3.5 w-3.5" /></a>}
            {mintedId && <Link data-testid="link-minted-nft" href={`/nft/${mintedId}`} className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-[hsl(var(--primary))] underline underline-offset-4">View NFT #{mintedId} <ArrowUpRight className="h-3.5 w-3.5" /></Link>}
          </form>
          <div className="lg:pt-3">
            <div className="mb-3 flex items-center justify-between"><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Metadata preview</p><span className="rounded-full border border-[hsl(var(--border))] px-2.5 py-1 font-mono-ui text-[9px] text-[hsl(var(--muted-foreground))]">not yet minted</span></div>
            <div className="max-w-lg">
              <MapTile title={preview.name || 'Untitled plot'} code="PREVIEW / DRAFT" tone="bg-[#d8dfc9]" image={image || undefined} />
              <div className="mt-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                <p className="font-mono-ui text-[9px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Record note</p>
                <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{preview.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">{preview.attributes?.map((attribute) => <span key={attribute.trait_type} className="rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 font-mono-ui text-[9px] uppercase tracking-[.08em]">{attribute.trait_type}: {attribute.value}</span>)}</div>
              </div>
            </div>
          </div>
        </div>
        {!CONTRACT_ADDRESS && <div className="mt-8 max-w-2xl"><ContractNotice compact /></div>}
      </div>
    </AppShell>
  );
}

export function PlotDetailPage() {
  const { tokenId = '' } = useParams<{ tokenId: string }>();
  const [plot, setPlot] = useState<RegistryRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    setLoading(true);
    setError('');
    void readPlot(tokenId).then(setPlot).catch((e) => setError(e instanceof Error ? e.message : 'Plot could not be read.')).finally(() => setLoading(false));
  }, [tokenId]);
  if (loading) return <AppShell><div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12"><LoadingTiles /></div></AppShell>;
  if (error || !plot || plot.error) return <AppShell><div className="mx-auto max-w-xl px-5 py-20 sm:px-8"><ContractNotice /></div></AppShell>;
  const metadata = plot.metadata;
  return (
    <AppShell>
      <NetworkBanner />
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <Link href="/explore" data-testid="link-back-explore" className="mb-10 inline-flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">← Back to registry</Link>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div><MapTile title={metadata?.name || `Plot ${tokenId}`} code="LIVE / REGISTRY" tokenId={tokenId} image={typeof metadata?.image === 'string' ? metadata.image : undefined} /></div>
          <div className="lg:pt-4">
            <p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">Token {tokenId}</p>
            <h1 className="mt-4 font-display text-6xl leading-[.9] text-[hsl(var(--primary))]">{metadata?.name || `Plot ${tokenId}`}</h1>
            <p className="mt-6 text-base leading-7 text-[hsl(var(--muted-foreground))]">{metadata?.description || 'This record has no description in its current metadata.'}</p>
            <div className="mt-8 divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))]">
              {plot.owner && <div className="flex items-center justify-between py-4"><span className="text-xs text-[hsl(var(--muted-foreground))]">Current owner</span><a data-testid="link-owner-address" href={explorerAddress(plot.owner)} target="_blank" rel="noreferrer" className="font-mono-ui text-xs underline underline-offset-4">{shortAddress(plot.owner)}</a></div>}
              <div className="flex items-center justify-between py-4"><span className="text-xs text-[hsl(var(--muted-foreground))]">Network</span><span className="font-mono-ui text-xs">Sepolia</span></div>
              <div className="flex items-center justify-between py-4"><span className="text-xs text-[hsl(var(--muted-foreground))]">Record</span><a data-testid="link-token-explorer" href={explorerToken(tokenId)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold">View on explorer <ExternalLink className="h-3.5 w-3.5" /></a></div>
            </div>
            {metadata?.attributes && <div className="mt-7 flex flex-wrap gap-2">{metadata.attributes.map((attribute) => <span key={`${attribute.trait_type}-${attribute.value}`} className="rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 font-mono-ui text-[9px] uppercase tracking-[.08em]">{attribute.trait_type}: {attribute.value}</span>)}</div>}
            <p className="mt-10 flex items-start gap-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--accent-foreground))]" />DHA shows only what the contract and metadata make available. There are no market actions in this registry.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export function ProfilePage() {
  const { address, isSepolia, connect, switchNetwork } = useWallet();
  const [copied, setCopied] = useState(false);
  const [ownedPlots, setOwnedPlots] = useState<RegistryRead[]>([]);
  const [loading, setLoading] = useState(false);
  const copy = async () => { if (address) { await navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 1600); } };
  useEffect(() => {
    if (!address || !CONTRACT_ADDRESS || !isSepolia) { setOwnedPlots([]); return; }
    setLoading(true);
    void readOwnedPlots(address).then(setOwnedPlots).catch(() => setOwnedPlots([])).finally(() => setLoading(false));
  }, [address, isSepolia]);
  return (
    <AppShell>
      <NetworkBanner />
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <PageIntro eyebrow="03 / Your collection" title="Your records, in one place.">A clear view of what your connected wallet can prove. DHA never fills the gaps with guesses.</PageIntro>
        {!address ? (
          <div className="max-w-xl rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--primary))]"><Sparkles className="h-5 w-5" /></div>
            <h2 className="mt-7 font-display text-4xl text-[hsl(var(--primary))]">Connect to see your records.</h2>
            <p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Your collection is read directly from the wallet you choose. No account, email, or custody layer required.</p>
            <button data-testid="button-connect-profile" onClick={() => void connect()} className="mt-7 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]">Connect wallet</button>
          </div>
        ) : (
          <>
            <div className="mb-10 flex flex-col justify-between gap-5 rounded-3xl bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] sm:flex-row sm:items-center sm:p-8">
              <div><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[hsl(var(--accent))]">Connected wallet</p><p className="mt-3 font-mono-ui text-sm">{shortAddress(address)}</p></div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/20 px-4 py-2.5 font-mono-ui text-[10px]">{loading ? 'reading records' : `${ownedPlots.length} ${ownedPlots.length === 1 ? 'record' : 'records'}`}</span>
                <button data-testid="button-copy-address" onClick={() => void copy()} className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-xs font-semibold transition hover:bg-white/10">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Copied' : 'Copy address'}</button>
                {!isSepolia && <button data-testid="button-switch-profile-network" onClick={() => void switchNetwork()} className="rounded-full bg-[hsl(var(--accent))] px-4 py-2.5 text-xs font-bold text-[hsl(var(--primary))]">Switch to Sepolia</button>}
              </div>
            </div>
            {!CONTRACT_ADDRESS ? <ContractNotice /> : loading ? <LoadingTiles /> : ownedPlots.length > 0 ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ownedPlots.map((plot) => <Link href={`/nft/${plot.tokenId}`} key={plot.tokenId} data-testid={`link-owned-plot-${plot.tokenId}`}><MapTile title={plot.metadata?.name || `Plot ${plot.tokenId}`} code="OWNED / REGISTRY" tokenId={plot.tokenId} image={typeof plot.metadata?.image === 'string' ? plot.metadata.image : undefined} /></Link>)}</div> : <div className="rounded-3xl border border-dashed border-[hsl(var(--border))] p-10 text-center"><p className="font-display text-3xl text-[hsl(var(--primary))]">No DHA plots in this wallet yet.</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">The collection is read from Sepolia directly. Mint your first digital plot to see it appear here.</p><Link href="/mint" data-testid="link-mint-from-profile" className="mt-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))] px-4 py-2.5 text-xs font-semibold">Mint a plot <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>}
          </>
        )}
      </div>
    </AppShell>
  );
}