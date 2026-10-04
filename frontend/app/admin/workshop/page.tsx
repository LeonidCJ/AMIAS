'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkshopRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/production');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans text-xs uppercase tracking-widest text-neutral-400">
      Redirigiendo a Consola de Producción del Taller...
    </div>
  );
}
