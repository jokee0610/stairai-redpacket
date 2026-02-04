import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { config } from './config';

let verifierKeypair: Keypair | null = null;

export function getVerifierKeypair(): Keypair {
  if (!verifierKeypair) {
    if (!config.verifierSecretKey) {
      throw new Error('VERIFIER_SECRET_KEY not set');
    }
    const secretKey = bs58.decode(config.verifierSecretKey);
    verifierKeypair = Keypair.fromSecretKey(secretKey);
  }
  return verifierKeypair;
}

export function getVerifierPublicKey(): string {
  return getVerifierKeypair().publicKey.toBase58();
}

export function signClaimTicket(
  wallet: string,
  twitterHandle: string,
  claimIndex: number
): string {
  const keypair = getVerifierKeypair();
  const message = `claim:${wallet}:${twitterHandle}:${claimIndex}`;
  const messageBytes = Buffer.from(message, 'utf-8');

  const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
  return bs58.encode(signature);
}
