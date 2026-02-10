// Production Configuration (Mainnet)
// Used when VERCEL_ENV=production or branch=master/main

export const prodConfig = {
  // Solana Network
  network: 'mainnet-beta' as const,
  programId: 'PLACEHOLDER_MAINNET_PROGRAM_ID', // TODO: Deploy to mainnet and update
  tokenMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // Real USDT on mainnet
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com',

  // Twitter (Production Account)
  twitterAccountToFollow: 'Stair_AI',
  twitterAccountId: '1993594720686424068',

  // Campaign
  maxClaims: 1000,
  skipTwitterVerification: false,
};
