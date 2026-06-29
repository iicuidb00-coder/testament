// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query') ?? '';
  if (!query.trim()) {
    return NextResponse.json({ error: '검색어를 입력하세요.' }, { status: 400 });
  }

  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(
      `https://bolls.life/search/KRV/?search=${encoded}&limit=100`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!res.ok) throw new Error(`bolls.life API 오류: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('검색 프록시 오류:', err);
    return NextResponse.json({ error: '검색 중 오류가 발생했습니다.' }, { status: 500 });
  }
}