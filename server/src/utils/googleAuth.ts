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
 * Cryptographically verifies a Google ID Token (JWT) using Google's public JWKS certificates.
 * Checks signature, issuer, audience, and expiration.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleUser> {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('ID_TOKEN_REQUIRED');
  }

  const clientId = config.googleClientId;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
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
