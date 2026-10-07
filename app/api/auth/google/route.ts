import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuthConsentUrl } from '@/lib/auth/googleOAuth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const returnUrl = searchParams.get('returnUrl') || searchParams.get('state') || '/';
    
    // Generate OAuth URL
    const googleAuthUrl = getGoogleOAuthConsentUrl(returnUrl);

    // If client requested JSON (for modal triggers)
    if (request.headers.get('accept')?.includes('application/json')) {
      return NextResponse.json({
        success: true,
        data: { url: googleAuthUrl },
      });
    }

    // Direct Browser Redirect to Google OAuth Consent screen
    return NextResponse.redirect(googleAuthUrl);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to initiate Google OAuth' } },
      { status: 500 }
    );
  }
}
