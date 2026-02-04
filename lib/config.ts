// Environment-based configuration
// Set these in Vercel dashboard or .env.local

export const config = {
  // Twitter
  twitterBearerToken: process.env.TWITTER_BEARER_TOKEN!,
  twitterAccountToFollow: process.env.TWITTER_ACCOUNT_TO_FOLLOW || 'Stair_AI',
  twitterAccountId: process.env.TWITTER_ACCOUNT_ID!,
  campaignTweetId: process.env.CAMPAIGN_TWEET_ID,
  skipTwitterVerification: process.env.SKIP_TWITTER_VERIFICATION === 'true',
  
  // Solana
  solanaNetwork: (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet') as 'devnet' | 'testnet' | 'mainnet-beta',
  programId: process.env.NEXT_PUBLIC_PROGRAM_ID!,
  
  // Campaign
  maxClaims: parseInt(process.env.MAX_CLAIMS || '1000'),
  
  // Verifier keypair (base58 encoded secret key)
  // Generate with: solana-keygen new --outfile verifier.json
  // Then base58 encode the array
  verifierSecretKey: process.env.VERIFIER_SECRET_KEY!,
};

export const getRpcUrl = () => {
  switch (config.solanaNetwork) {
    case 'mainnet-beta':
      return process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
    case 'testnet':
      return 'https://api.testnet.solana.com';
    default:
      return 'https://api.devnet.solana.com';
  }
};
