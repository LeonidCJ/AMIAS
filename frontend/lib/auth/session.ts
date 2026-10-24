/**
 * Utilidades de sesión del lado del cliente (RBAC de navegación).
 *
 * IMPORTANTE: esto solo controla la NAVEGACIÓN del frontend. La seguridad real
 * vive en el backend (JwtAuthGuard + RolesGuard), que rechaza cualquier request
 * sin token válido o con rol insuficiente.
 */

export type UserRole = 'ADMIN' | 'OPERARIO' | 'CLIENT';

export interface ActiveSession {
  token: string;
  role: UserRole;
  userId: string;
  email: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const SESSION_KEYS = [
  'access_token',
  'user_role',
  'user_name',
  'user_email',
  'user_phone',
  'user_id',
];

export const AUTH_CHANGE_EVENT = 'amias-auth-change';

const VALID_ROLES: UserRole[] = ['ADMIN', 'OPERARIO', 'CLIENT'];

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
}

/** Decodifica el payload de un JWT (base64url) sin verificar la firma. */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function toSession(token: string): ActiveSession | null {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.role || !VALID_ROLES.includes(payload.role as UserRole)) {
    return null;
  }
  return {
    token,
    role: payload.role as UserRole,
    userId: payload.sub || '',
    email: payload.email || '',
  };
}

function isExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  // Margen de 10 s para evitar usar un token a punto de vencer
  return Date.now() >= payload.exp * 1000 - 10_000;
}

/** Elimina todos los datos de sesión del navegador y notifica al guardia de rutas. */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

/**
 * Pide un nuevo accessToken usando la cookie HttpOnly `refreshToken`.
 * Se deduplica para que dos llamadas simultáneas (p. ej. React StrictMode)
 * no "quemen" el refresh token de un solo uso.
 */
let refreshInFlight: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.accessToken) return null;
        localStorage.setItem('access_token', data.accessToken);
        if (data.user?.role) localStorage.setItem('user_role', data.user.role);
        return data.accessToken as string;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

/**
 * Resuelve la sesión activa:
 *  - Token válido → sesión.
 *  - Token vencido → intenta rotarlo con /auth/refresh; si falla, limpia la sesión.
 *  - Sin token o token corrupto → null (visitante).
 */
export async function resolveSession(): Promise<ActiveSession | null> {
  if (typeof window === 'undefined') return null;

  let token = localStorage.getItem('access_token');
  if (!token) return null;

  if (isExpired(token)) {
    token = await refreshAccessToken();
    if (!token) {
      clearSession();
      return null;
    }
  }

  const session = toSession(token);
  if (!session) {
    clearSession();
    return null;
  }

  // El rol del token manda sobre lo que haya en localStorage
  if (localStorage.getItem('user_role') !== session.role) {
    localStorage.setItem('user_role', session.role);
  }

  return session;
}

/** Cierra la sesión localmente y revoca el refresh token en el backend. */
export function logout(): void {
  clearSession();
  fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
}

export function isStaffRole(role: UserRole | null | undefined): boolean {
  return role === 'ADMIN' || role === 'OPERARIO';
}

/** Pantalla de inicio según el rol. */
export function getHomeForRole(role: UserRole | null | undefined): string {
  return isStaffRole(role) ? '/admin/production' : '/catalog';
}

/** Valida que un parámetro `next` sea una ruta interna segura para un cliente. */
export function sanitizeNextPath(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith('/') || next.startsWith('//')) return null;
  if (next === '/admin' || next.startsWith('/admin/')) return null;
  if (next === '/login' || next.startsWith('/login?')) return null;
  return next;
}
