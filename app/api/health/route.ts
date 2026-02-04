import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { getVerifierPublicKey } from '@/lib/signer';
import { getStats } from '@/lib/state';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      verifier: getVerifierPublicKey(),
      twitterAccount: `@${config.twitterAccountToFollow}`,
      network: config.solanaNetwork,
      skipVerification: config.skipTwitterVerification,
      ...getStats(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', error: error.message },
      { status: 500 }
    );
  }
}
