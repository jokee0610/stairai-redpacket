import { config } from './config';

// In-memory state (for serverless, consider using Redis/Upstash for persistence)
// For MVP, this works since Vercel keeps functions warm

interface ClaimRecord {
  twitterHandle: string;
  claimIndex: number;
  signature: string;
  timestamp: number;
}

interface State {
  nextClaimIndex: number;
  claims: Map<string, ClaimRecord>; // keyed by wallet
  usedTwitterHandles: Set<string>;
}

// Global state (persists across warm function invocations)
const state: State = {
  nextClaimIndex: 0,
  claims: new Map(),
  usedTwitterHandles: new Set(),
};

export function getState() {
  return state;
}

export function getStats() {
  return {
    totalSlots: config.maxClaims,
    claimed: state.nextClaimIndex,
    remaining: config.maxClaims - state.nextClaimIndex,
  };
}

export function isWalletClaimed(wallet: string): ClaimRecord | undefined {
  return state.claims.get(wallet);
}

export function isTwitterHandleUsed(handle: string): boolean {
  return state.usedTwitterHandles.has(handle.toLowerCase());
}

export function isCampaignFull(): boolean {
  return state.nextClaimIndex >= config.maxClaims;
}

export function recordClaim(
  wallet: string,
  twitterHandle: string,
  claimIndex: number,
  signature: string
): void {
  const normalizedHandle = twitterHandle.toLowerCase();
  
  state.claims.set(wallet, {
    twitterHandle: normalizedHandle,
    claimIndex,
    signature,
    timestamp: Date.now(),
  });
  
  state.usedTwitterHandles.add(normalizedHandle);
  state.nextClaimIndex++;
}

export function getNextClaimIndex(): number {
  return state.nextClaimIndex;
}

// For production, you'd want to persist this to a database
// Options:
// - Vercel KV (Redis)
// - Upstash Redis
// - PlanetScale (MySQL)
// - Supabase (Postgres)
