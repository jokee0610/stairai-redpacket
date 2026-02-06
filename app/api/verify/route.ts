import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { verifyTwitterFollow } from '@/lib/twitter';
import { signClaimTicket } from '@/lib/signer';
import {
  getStats,
  isWalletClaimed,
  isTwitterHandleUsed,
  isCampaignFull,
  recordClaim,
  getNextClaimIndex,
} from '@/lib/state';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, twitterHandle } = body;

    // Validate inputs
    if (!wallet || !twitterHandle) {
      return NextResponse.json(
        { error: 'Missing wallet or twitterHandle' },
        { status: 400 }
      );
    }

    // Normalize Twitter handle
    const normalizedHandle = twitterHandle.trim().toLowerCase().replace('@', '');

    // Check if campaign is full
    if (isCampaignFull()) {
      return NextResponse.json(
        { error: 'Campaign is full! All red packets have been claimed.' },
        { status: 400 }
      );
    }

    // Check if wallet already verified
    const existingClaim = isWalletClaimed(wallet);
    if (existingClaim) {
      return NextResponse.json({
        success: true,
        claimIndex: existingClaim.claimIndex,
        signature: existingClaim.signature,
        message: 'Already verified',
      });
    }

    // Check if Twitter handle already used
    if (isTwitterHandleUsed(normalizedHandle)) {
      return NextResponse.json(
        { error: 'This Twitter account has already been used' },
        { status: 400 }
      );
    }

    // Verify Twitter follow
    const isFollowing = await verifyTwitterFollow(normalizedHandle);

    if (!isFollowing) {
      return NextResponse.json(
        { error: `Must follow @${config.twitterAccountToFollow} on Twitter` },
        { status: 400 }
      );
    }

    // Assign claim index and sign
    const claimIndex = getNextClaimIndex();
    const signature = signClaimTicket(wallet, normalizedHandle, claimIndex);

    // Record the claim
    recordClaim(wallet, normalizedHandle, claimIndex, signature);

    console.log(`✅ Verified: wallet=${wallet.slice(0, 8)}... twitter=@${normalizedHandle} index=${claimIndex}`);

    return NextResponse.json({
      success: true,
      claimIndex,
      signature,
      message: 'Verified! You can now claim your red packet.',
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
