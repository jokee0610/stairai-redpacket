// Environment-based configuration loader
// Automatically selects staging.conf or prod.conf based on environment

import { stagingConfig } from '../config/staging.conf';
import { prodConfig } from '../config/prod.conf';

// Determine environment: production uses prod.conf, everything else uses staging.conf
// VERCEL_ENV: 'production' | 'preview' | 'development'
const isProduction = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
const envConfig = isProduction ? prodConfig : stagingConfig;

export const config = {
  // Twitter API (secrets from env vars)
  twitterBearerToken: process.env.TWITTER_BEARER_TOKEN!,
  twitterAccountToFollow: envConfig.twitterAccountToFollow,
  twitterAccountId: envConfig.twitterAccountId,
  campaignTweetId: process.env.CAMPAIGN_TWEET_ID,
  skipTwitterVerification: process.env.SKIP_TWITTER_VERIFICATION === 'true' || envConfig.skipTwitterVerification,

  // Solana (from conf file)
  solanaNetwork: envConfig.network,
  programId: process.env.NEXT_PUBLIC_PROGRAM_ID || envConfig.programId,
  tokenMint: process.env.NEXT_PUBLIC_TOKEN_MINT || envConfig.tokenMint,

  // Campaign
  maxClaims: envConfig.maxClaims,

  // Verifier keypair (secret from env var)
  verifierSecretKey: process.env.VERIFIER_SECRET_KEY!,
};

export const getRpcUrl = () => {
  // Allow override via env var, otherwise use config
  if (process.env.NEXT_PUBLIC_RPC_URL) {
    return process.env.NEXT_PUBLIC_RPC_URL;
  }
  return envConfig.rpcUrl;
};

// Export for debugging/logging
export const getEnvironment = () => ({
  isProduction,
  vercelEnv: process.env.VERCEL_ENV,
  nodeEnv: process.env.NODE_ENV,
  configUsed: isProduction ? 'prod.conf' : 'staging.conf',
});
