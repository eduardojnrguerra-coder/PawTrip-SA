import { ImageResponse } from 'next/og';
import { getSiteUrl, siteName, siteTagline } from '@/lib/site';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f5efe3',
          color: '#174132',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800 }}>{siteName}</div>
        <div style={{ fontSize: 36, maxWidth: 900 }}>{siteTagline}</div>
        <div style={{ fontSize: 28, color: '#5c665c' }}>{getSiteUrl()}</div>
      </div>
    ),
    size,
  );
}

