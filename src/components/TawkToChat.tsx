'use client';

import { useEffect } from 'react';

// Free Tawk.to live-chat widget.
// Set NEXT_PUBLIC_TAWK_PROPERTY_ID and NEXT_PUBLIC_TAWK_WIDGET_ID in .env.local
// after creating a free account at https://tawk.to — no credit card required.
export default function TawkToChat() {
  useEffect(() => {
    const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
    const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID ?? 'default';

    if (!propertyId) return; // no-op until credentials are configured

    const s = document.createElement('script');
    s.async = true;
    s.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    s.charset = 'UTF-8';
    s.setAttribute('crossorigin', '*');
    document.head.appendChild(s);

    return () => {
      // Clean up on unmount (edge case — layout rarely unmounts)
      if (document.head.contains(s)) document.head.removeChild(s);
    };
  }, []);

  return null; // Tawk.to injects its own UI into the DOM
}
