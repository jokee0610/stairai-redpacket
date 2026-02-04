import { config } from './config';

export async function verifyTwitterFollow(twitterHandle: string): Promise<boolean> {
  if (config.skipTwitterVerification) {
    console.log(`[SKIP] Would verify follow for @${twitterHandle}`);
    return true;
  }

  try {
    // Get user ID from handle
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${twitterHandle}`,
      {
        headers: { Authorization: `Bearer ${config.twitterBearerToken}` },
      }
    );
    const userData = await userResponse.json();
    if (!userData.data?.id) {
      console.log(`Twitter user not found: @${twitterHandle}`);
      return false;
    }

    const userId = userData.data.id;

    // Check if they follow the target account
    const followResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/following?max_results=1000`,
      {
        headers: { Authorization: `Bearer ${config.twitterBearerToken}` },
      }
    );
    const followData = await followResponse.json();

    const isFollowing = followData.data?.some(
      (user: any) => user.id === config.twitterAccountId
    );

    console.log(`Follow check: @${twitterHandle} follows @${config.twitterAccountToFollow}? ${isFollowing}`);
    return isFollowing;
  } catch (error) {
    console.error('Twitter follow check failed:', error);
    return false;
  }
}

export async function verifyTwitterRetweet(twitterHandle: string): Promise<boolean> {
  if (config.skipTwitterVerification) {
    console.log(`[SKIP] Would verify retweet for @${twitterHandle}`);
    return true;
  }

  // Skip if no campaign tweet set
  if (!config.campaignTweetId || config.campaignTweetId === 'PLACEHOLDER_UNTIL_LAUNCH') {
    console.log('[SKIP] No campaign tweet ID set');
    return true;
  }

  try {
    // Get user ID from handle
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${twitterHandle}`,
      {
        headers: { Authorization: `Bearer ${config.twitterBearerToken}` },
      }
    );
    const userData = await userResponse.json();
    if (!userData.data?.id) return false;

    const userId = userData.data.id;

    // Check retweeters
    const retweetResponse = await fetch(
      `https://api.twitter.com/2/tweets/${config.campaignTweetId}/retweeted_by`,
      {
        headers: { Authorization: `Bearer ${config.twitterBearerToken}` },
      }
    );
    const retweetData = await retweetResponse.json();

    const hasRetweeted = retweetData.data?.some(
      (user: any) => user.id === userId
    );

    console.log(`Retweet check: @${twitterHandle} retweeted? ${hasRetweeted}`);
    return hasRetweeted;
  } catch (error) {
    console.error('Twitter retweet check failed:', error);
    return false;
  }
}
