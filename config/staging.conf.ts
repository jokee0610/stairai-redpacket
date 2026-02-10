// Staging Configuration (Devnet)
// Used when VERCEL_ENV=preview or branch=develop

export const stagingConfig = {
  // Solana Network
  network: 'devnet' as const,
  programId: 'G19RgZSMU8Xt1RSvfZjyaNpDefEy3ZKYW61oKx7cHN9H',
  tokenMint: 'Fyv3QC2MBDhFaYZNSnhVJxqSbL9p9KNgxBDyyJnrM5xP', // TUSDT devnet
  rpcUrl: 'https://api.devnet.solana.com',

  // Twitter (Test Account)
  twitterAccountToFollow: 'colin0095',
  twitterAccountId: '1493986560232267778',

  // Campaign
  maxClaims: 1000,
  skipTwitterVerification: false,
};
