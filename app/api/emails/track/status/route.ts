import { NextRequest, NextResponse } from 'next/server';
import { getOpenStatus } from '@/lib/tracking-store';

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get('ids');
  if (!idsParam) {
    return NextResponse.json({ error: 'ids parameter required' }, { status: 400 });
  }
  const ids = idsParam.split(',').filter(Boolean);
  const status = getOpenStatus(ids);
  return NextResponse.json({ status });
}
