'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AUTH_CHANGE_EVENT,
  UserRole,
  isStaffRole,
  resolveSession,
} from '../../lib/auth/session';

/** Rutas que requieren sesión de CLIENTE. */
const CLIENT_PROTECTED_ROUTES = ['/profile', '/customer', '/checkout'];

function matches(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(route + '/');
}

/**
 * Decide si la ruta está permitida para el rol actual.
 * Devuelve la ruta destino si hay que redirigir, o `null` si se permite el acceso.
 *
 *  - ADMIN / OPERARIO → solo /admin/*. Todo lo demás → /admin/production.
 *  - CLIENT           → vistas de cliente. "/", "/login" y /admin/* → /catalog.
 *  - Visitante        → catálogo público. "/" → /catalog.
 *                       /admin/*, /profile, /customer/*, /checkout → /login.
 */
function resolveRedirect(pathname: string, search: string, role: UserRole | null): string | null {
  const isAdminRoute = matches(pathname, '/admin');
  const isClientProtected = CLIENT_PROTECTED_ROUTES.some((r) => matches(pathname, r));

  if (isStaffRole(role)) {
    if (!isAdminRoute || pathname === '/admin') return '/admin/production';
    return null;
  }

  if (role === 'CLIENT') {
    if (isAdminRoute || pathname === '/' || pathname === '/login') return '/catalog';
    return null;
  }

  // Visitante sin sesión
  if (isAdminRoute) return '/login';
  if (isClientProtected) return `/login?next=${encodeURIComponent(pathname + search)}`;
  if (pathname === '/') return '/catalog';
  return null;
}

export const AuthRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [authorizedPath, setAuthorizedPath] = useState<string | null>(null);
  const [recheckTick, setRecheckTick] = useState(0);

  // Re-evaluar cuando la sesión cambia (logout, otra pestaña, etc.)
  useEffect(() => {
    const onAuthChange = () => setRecheckTick((t) => t + 1);
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === 'access_token' || e.key === 'user_role') onAuthChange();
    };
    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const session = await resolveSession();
      if (cancelled) return;

      const target = resolveRedirect(pathname, window.location.search, session?.role ?? null);
      if (target) {
        setAuthorizedPath(null);
        router.replace(target);
      } else {
        setAuthorizedPath(pathname);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, recheckTick, router]);

  // No renderizar la pantalla hasta confirmar que el rol tiene acceso a esta ruta
  if (authorizedPath !== pathname) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans text-xs uppercase tracking-widest text-neutral-400">
        Verificando sesión...
      </div>
    );
  }

  return <>{children}</>;
};
