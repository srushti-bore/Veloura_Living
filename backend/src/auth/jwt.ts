/**
 * 🏛️ Veloura Living — Universal JWT Signing & Verification
 * Built with Web Crypto API for Edge & Node.js runtimes.
 * Reference: docs/Veloura_Living_SRS.md (Section 31)
 */

import { JWTPayload, UserRoleEnum } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'veloura-living-master-luxury-jwt-secret-2026-auth-token';
export const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes (SRS AUTH-004)
export const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days (SRS AUTH-004)
const DEFAULT_EXPIRATION_SECONDS = ACCESS_TOKEN_EXPIRY_SECONDS;

function base64UrlEncode(data: string | Uint8Array): string {
  let base64 = '';
  if (typeof data === 'string') {
    const bytes = new TextEncoder().encode(data);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    base64 = btoa(binary);
  } else {
    let binary = '';
    for (let i = 0; i < data.byteLength; i++) {
      binary += String.fromCharCode(data[i]);
    }
    base64 = btoa(binary);
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecodeToBytes(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlDecode(str: string): string {
  const bytes = base64UrlDecodeToBytes(str);
  return new TextDecoder().decode(bytes);
}

async function getCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signToken(
  userId: string,
  email: string,
  roles: UserRoleEnum[],
  expiresInSeconds = DEFAULT_EXPIRATION_SECONDS
): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    sub: userId,
    email,
    roles,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey();
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(dataToSign)
  );

  const encodedSignature = base64UrlEncode(new Uint8Array(signature));
  return `${dataToSign}.${encodedSignature}`;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const dataToVerify = `${headerB64}.${payloadB64}`;

    const key = await getCryptoKey();
    const signatureBytes = base64UrlDecodeToBytes(signatureB64);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as any,
      new TextEncoder().encode(dataToVerify)
    );

    if (!isValid) return null;

    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
