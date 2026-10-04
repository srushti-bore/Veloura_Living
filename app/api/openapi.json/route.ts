import { NextResponse } from 'next/server';
import { openapiSpec } from '@/lib/docs/openapiSpec';

export async function GET() {
  return NextResponse.json(openapiSpec, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
