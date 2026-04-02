// app/api/dramabox/detail/[id]/route.js
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const res = await fetch(
      `https://dramabox.sansekai.my.id/api/dramabox/detail/${id}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://dramabox.sansekai.my.id',
        },
        next: { revalidate: 3600 }
      }
    );

    if (!res.ok) return NextResponse.json(null, { status: 404 });

    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.data || []);
    const drama = list.find(item => String(item.bookId) === String(id));

    if (!drama) return NextResponse.json(null, { status: 404 });

    return NextResponse.json(drama);

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}