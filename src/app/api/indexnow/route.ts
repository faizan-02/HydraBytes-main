import { NextResponse } from 'next/server';

const KEY = 'd79d2cdb5cb498b6176799bf38bc3ab7';
const HOST = 'www.hydrabytes.it.com';
const BASE_URL = `https://${HOST}`;

const URLS = [
  `${BASE_URL}/`,
  `${BASE_URL}/services`,
  `${BASE_URL}/portfolio`,
  `${BASE_URL}/about`,
  `${BASE_URL}/pricing`,
  `${BASE_URL}/blog`,
  `${BASE_URL}/contact`,
  `${BASE_URL}/legal/privacy`,
  `${BASE_URL}/legal/terms`,
  `${BASE_URL}/legal/refund`,
];

export async function GET() {
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `${BASE_URL}/${KEY}.txt`,
        urlList: URLS,
      }),
    });

    if (res.ok || res.status === 202) {
      return NextResponse.json({ success: true, submitted: URLS.length, status: res.status });
    }

    const text = await res.text();
    return NextResponse.json({ success: false, status: res.status, body: text }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
