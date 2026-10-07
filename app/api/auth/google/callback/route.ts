import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeGoogleAuthorizationCode,
  fetchGoogleUserProfile,
  getMockGoogleUserProfile,
  GoogleUserInfo,
} from '@/lib/auth/googleOAuth';
import { findOrCreateGoogleUser } from '@/lib/data/authStore';
import { signToken } from '@/lib/auth/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state') || '/';
    const isMock = searchParams.get('mock') === 'true';
    const error = searchParams.get('error');

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (error) {
      console.warn('Google OAuth denied or returned error:', error);
      return NextResponse.redirect(`${baseUrl}/?authError=${encodeURIComponent(error)}`);
    }

    let googleUser: GoogleUserInfo;

    if (isMock || (!code && process.env.NODE_ENV !== 'production')) {
      // Development fallback when testing without live Google credentials
      googleUser = getMockGoogleUserProfile();
    } else {
      if (!code) {
        return NextResponse.redirect(`${baseUrl}/?authError=missing_authorization_code`);
      }

      // Exchange authorization code for access token
      const tokenData = await exchangeGoogleAuthorizationCode(code);
      
      // Fetch user profile from Google API
      googleUser = await fetchGoogleUserProfile(tokenData.access_token);
    }

    if (!googleUser.email) {
      return NextResponse.redirect(`${baseUrl}/?authError=missing_google_email`);
    }

    // Find or create user in database/store
    const userRecord = await findOrCreateGoogleUser({
      googleId: googleUser.id,
      email: googleUser.email,
      firstName: googleUser.given_name || googleUser.name.split(' ')[0] || 'Client',
      lastName: googleUser.family_name || googleUser.name.split(' ').slice(1).join(' ') || '',
      avatarUrl: googleUser.picture,
    });

    // Generate Veloura Living JWT token (valid for 7 days)
    const token = await signToken(userRecord.user.id, userRecord.user.email, userRecord.roles);

    // Determine redirect destination
    const destinationPath = state.startsWith('/') ? state : '/';
    const redirectUrl = new URL(destinationPath, baseUrl);
    redirectUrl.searchParams.set('authSuccess', 'google');

    const response = NextResponse.redirect(redirectUrl);

    // Set secure authentication cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Google OAuth Callback Error:', err);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${baseUrl}/?authError=${encodeURIComponent(err.message || 'google_auth_failed')}`
    );
  }
}
