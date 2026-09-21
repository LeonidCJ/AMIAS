import './globals.css';
import React from 'react';

export const metadata = {
  title: 'AMIAS — Oficial & Custom Apparel',
  description: 'Catálogo oficial de indumentaria para conciertos y giras en Lima, Perú.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="selection:bg-neutral-900 selection:text-white min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
