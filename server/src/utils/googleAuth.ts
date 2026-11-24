import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';

const client = new OAuth2Client(
  config.googleClientId,
  config.googleClientSecret
);

export interface VerifiedGoogleUser {
  email: string;
  name: string;
  avatarUrl?: string;
  googleId: string;
  emailVerified: boolean;
}

/**
 * Cryptographically verifies a Google Token (ID Token JWT or OAuth2 Access Token).
 * Supports both Google Identity Services (GSI) ID tokens and OAuth2 token client access tokens.
 * Verifies signature, issuer, audience/tokeninfo, expiration, and email_verified.
 */
export async function verifyGoogleToken(token: string): Promise<VerifiedGoogleUser> {
  if (!token || typeof token !== 'string') {
    throw new Error('ID_TOKEN_REQUIRED');
  }

  const clientId = config.googleClientId;

  // Case 1: JWT ID Token format (three segments separated by dots)
  if (token.includes('.') && token.split('.').length === 3) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: clientId ? clientId : undefined
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('INVALID_TOKEN_PAYLOAD');
      }

      if (!payload.email) {
        throw new Error('EMAIL_NOT_PROVIDED');
      }

      if (!payload.email_verified) {
        throw new Error('EMAIL_NOT_VERIFIED');
      }

      return {
        email: payload.email.toLowerCase().trim(),
        name: payload.name || payload.email.split('@')[0],
        avatarUrl: payload.picture,
        googleId: payload.sub,
        emailVerified: !!payload.email_verified
      };
    } catch (error: any) {
      if (error.message === 'ID_TOKEN_REQUIRED' || error.message === 'INVALID_TOKEN_PAYLOAD' || error.message === 'EMAIL_NOT_PROVIDED' || error.message === 'EMAIL_NOT_VERIFIED') {
        throw error;
      }
      throw new Error(`GOOGLE_TOKEN_VERIFICATION_FAILED: ${error.message}`);
    }
  }

  // Case 2: OAuth2 Access Token format (e.g. from initTokenClient popup flow)
  try {
    const tokenInfo = await client.getTokenInfo(token);
    if (!tokenInfo.email) {
      throw new Error('EMAIL_NOT_PROVIDED');
    }
    if (!tokenInfo.email_verified) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    // Fetch user profile from official Google UserInfo endpoint
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Google userinfo returned status ${response.status}`);
    }

    const userInfo: any = await response.json();

    return {
      email: userInfo.email.toLowerCase().trim(),
      name: userInfo.name || userInfo.email.split('@')[0],
      avatarUrl: userInfo.picture,
      googleId: userInfo.sub || tokenInfo.sub || '',
      emailVerified: true
    };
  } catch (error: any) {
    if (error.message === 'ID_TOKEN_REQUIRED' || error.message === 'INVALID_TOKEN_PAYLOAD' || error.message === 'EMAIL_NOT_PROVIDED' || error.message === 'EMAIL_NOT_VERIFIED') {
      throw error;
    }
    throw new Error(`GOOGLE_TOKEN_VERIFICATION_FAILED: ${error.message}`);
  }
}

/**
 * Backwards-compatible alias for verifyGoogleToken
 */
export const verifyGoogleIdToken = verifyGoogleToken;

/**
 * Generates official Google OAuth 2.0 authorization URL for redirect flow.
 */
export function getGoogleOAuthUrl(redirectUri: string, state?: string): string {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: redirectUri,
    client_id: config.googleClientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid'
    ].join(' '),
    state: state || ''
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

export function isGoogleConfigured(): boolean {
  return !!config.googleClientId;
}

/**
 * Exchanges authorization code for tokens in redirect flow.
 */
export async function exchangeCodeForGoogleTokens(code: string, redirectUri: string) {
  const { tokens } = await client.getToken({
    code,
    redirect_uri: redirectUri
  });

  if (!tokens.id_token) {
    throw new Error('NO_ID_TOKEN_IN_RESPONSE');
  }

  return verifyGoogleIdToken(tokens.id_token);
}
