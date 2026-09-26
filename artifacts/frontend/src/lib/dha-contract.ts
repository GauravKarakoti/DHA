import { encodeFunctionData, keccak256, stringToBytes } from 'viem';

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export type PlotMetadata = {
  name?: string;
  description?: string;
  image?: string;
  external_url?: string;
  attributes?: Array<{ trait_type?: string; value?: string | number }>;
  [key: string]: unknown;
};

export type RegistryRead = {
  tokenId: string;
  uri?: string;
  metadata?: PlotMetadata;
  owner?: string;
  error?: string;
};

const DHA_ABI = [
  {
    type: 'function',
    name: 'mintPlot',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'metadataURI', type: 'string' },
      { name: 'plotNumber', type: 'uint256' },
      { name: 'blockName', type: 'string' },
      { name: 'area', type: 'uint256' },
      { name: 'location', type: 'string' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
] as const;
const PLOT_MINTED_TOPIC = keccak256(stringToBytes('PlotMinted(uint256,address,uint256)'));

export type TransactionReceipt = {
  status?: string;
  logs?: Array<{ topics?: string[] }>;
};

declare global {
  interface Window { ethereum?: EthereumProvider; }
}

export const SEPOLIA_CHAIN_ID = import.meta.env.VITE_SEPOLIA_CHAIN_ID || '0xaa36a7';
export const CONTRACT_ADDRESS = import.meta.env.VITE_DHA_CONTRACT_ADDRESS || '';
const explorerBase = 'https://sepolia.etherscan.io';

export const explorerAddress = (address: string) => `${explorerBase}/address/${address}`;
export const explorerTx = (hash: string) => `${explorerBase}/tx/${hash}`;
export const explorerToken = (tokenId: string) => CONTRACT_ADDRESS ? `${explorerBase}/token/${CONTRACT_ADDRESS}?a=${tokenId}` : explorerBase;
export const mediaUri = (uri?: string) => uri?.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${uri.slice(7)}` : uri;

export const getProvider = () => window.ethereum;
export const shortAddress = (value?: string) => value ? `${value.slice(0, 6)}…${value.slice(-4)}` : 'Not connected';

const pad32 = (hex: string) => hex.replace(/^0x/, '').padStart(64, '0');
const uintArg = (value: string | number) => pad32(BigInt(value).toString(16));
const decodeHexString = (hex: string) => {
  const clean = hex.replace(/^0x/, '');
  if (!clean) return '';
  try {
    const bytes = new Uint8Array(clean.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []);
    return new TextDecoder().decode(bytes).replace(/\0+$/, '');
  } catch { return ''; }
};
const encodeCall = (selector: string, args = '') => `${selector}${args}`;

export async function rpc(method: string, params: unknown[] = []) {
  const provider = getProvider();
  if (!provider) throw new Error('A browser wallet is not installed.');
  return provider.request({ method, params });
}

export async function getWalletState() {
  if (!getProvider()) return { address: '', chainId: '' };
  const [accounts, chainId] = await Promise.all([
    rpc('eth_accounts') as Promise<string[]>,
    rpc('eth_chainId') as Promise<string>,
  ]);
  return { address: accounts[0] || '', chainId };
}

export async function requestWallet() {
  const accounts = await rpc('eth_requestAccounts') as string[];
  const chainId = await rpc('eth_chainId') as string;
  return { address: accounts[0] || '', chainId };
}

export async function switchToSepolia() {
  try {
    await rpc('wallet_switchEthereumChain', [{ chainId: SEPOLIA_CHAIN_ID }]);
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code === 4902) await rpc('wallet_addEthereumChain', [{ chainId: SEPOLIA_CHAIN_ID, chainName: 'Sepolia', nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://rpc.sepolia.org'], blockExplorerUrls: [explorerBase] }]);
    else throw error;
  }
}

export async function contractCall(data: string) {
  if (!CONTRACT_ADDRESS) throw new Error('The DHA contract address is not configured.');
  return rpc('eth_call', [{ to: CONTRACT_ADDRESS, data }, 'latest']) as Promise<string>;
}

export async function readTotalSupply() {
  const result = await contractCall('0x18160ddd');
  return Number(BigInt(result));
}

export async function readBalance(address: string) {
  const result = await contractCall(`0x70a08231${address.replace(/^0x/, '').padStart(64, '0')}`);
  return Number(BigInt(result));
}

export async function readPlot(tokenId: string): Promise<RegistryRead> {
  const result: RegistryRead = { tokenId };
  try {
    const rawUri = await contractCall(encodeCall('0xc87b56dd', uintArg(tokenId)));
    result.uri = decodeHexString(rawUri.slice(130));
    if (result.uri) result.metadata = await resolveMetadata(result.uri);
  } catch { result.error = 'This plot has no readable metadata yet.'; }
  try {
    const owner = await contractCall(encodeCall('0x6352211e', uintArg(tokenId)));
    result.owner = `0x${owner.slice(-40)}`;
  } catch { /* ownerOf is optional for a registry preview */ }
  return result;
}

export async function readOwnedPlots(address: string): Promise<RegistryRead[]> {
  const total = await readTotalSupply();
  if (!total) return [];
  const plots = await Promise.all(
    Array.from({ length: total }, (_, index) => readPlot(String(index + 1))),
  );
  return plots.filter((plot) => plot.owner?.toLowerCase() === address.toLowerCase());
}

export async function resolveMetadata(uri: string): Promise<PlotMetadata> {
  if (uri.startsWith('data:application/json')) {
    const payload = uri.slice(uri.indexOf(',') + 1);
    return JSON.parse(uri.includes(';base64') ? atob(payload) : decodeURIComponent(payload)) as PlotMetadata;
  }
  const target = uri.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${uri.slice(7)}` : uri;
  const response = await fetch(target);
  if (!response.ok) throw new Error('Metadata could not be retrieved.');
  return response.json() as Promise<PlotMetadata>;
}

export async function mintPlot(
  uri: string,
  from: string,
  plotNumber: string,
  blockName: string,
  area: string,
  location: string,
) {
  if (!CONTRACT_ADDRESS) throw new Error('The DHA contract address is not configured.');
  const data = encodeFunctionData({
    abi: DHA_ABI,
    functionName: 'mintPlot',
    args: [from as `0x${string}`, uri, BigInt(plotNumber), blockName, BigInt(area), location],
  });
  return rpc('eth_sendTransaction', [{ from, to: CONTRACT_ADDRESS, data }]) as Promise<string>;
}

export async function waitForTransaction(hash: string): Promise<TransactionReceipt> {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const receipt = await rpc('eth_getTransactionReceipt', [hash]) as TransactionReceipt | null;
    if (receipt) {
      if (receipt.status === '0x0') throw new Error('The mint transaction reverted on-chain.');
      return receipt;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
  }
  throw new Error('The transaction is taking longer than expected. Check Sepolia Etherscan for its status.');
}

export function mintedTokenId(receipt: TransactionReceipt) {
  const log = receipt.logs?.find((entry) => entry.topics?.[0]?.toLowerCase() === PLOT_MINTED_TOPIC.toLowerCase());
  const topic = log?.topics?.[1];
  return topic ? BigInt(topic).toString() : '';
}