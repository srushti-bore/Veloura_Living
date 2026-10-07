/**
 * 🏛️ Veloura Living — Google OAuth 2.0 Client Utility
 * Reference: docs/Veloura_Living_SRS.md (Section 31 & Authentication Architecture)
 */

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
  scope?: string;
}

/**
 * Build the Google OAuth 2.0 Authorization URL for User Consent
 */
export function getGoogleOAuthConsentUrl(state?: string, customRedirectUri?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = customRedirectUri || `${baseUrl}/api/auth/google/callback`;

  // If Client ID is not configured in .env, direct to local sandbox simulation
  if (!clientId || clientId === 'your-google-client-id.apps.googleusercontent.com') {
    return `${baseUrl}/api/auth/google/callback?mock=true&state=${encodeURIComponent(state || '/')}`;
  }

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid',
    ].join(' '),
    state: state || '/',
  };

  const qs = new URLSearchParams(options).toString();
  return `${rootUrl}?${qs}`;
}

/**
 * Exchange Authorization Code for Google Access & ID Tokens
 */
export async function exchangeGoogleAuthorizationCode(
  code: string,
  customRedirectUri?: string
): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = customRedirectUri || `${baseUrl}/api/auth/google/callback`;

  const values = {
    code,
    client_id: clientId || '',
    client_secret: clientSecret || '',
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  };

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(values).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google token exchange failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Fetch Google User Profile using Access Token
 */
export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Google user profile (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Return default mock Google user for development sandbox testing
 */
export function getMockGoogleUserProfile(): GoogleUserInfo {
  return {
    id: 'google_user_mock_' + Date.now(),
    email: 'client@example.com',
    verified_email: true,
    name: 'Aarav Mehta',
    given_name: 'Aarav',
    family_name: 'Mehta',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  };
}
