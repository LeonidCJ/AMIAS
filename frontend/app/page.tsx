/**
 * Raíz "/": no tiene contenido propio.
 * AuthRouteGuard (app/layout.tsx) decide el destino según la sesión activa:
 *  - ADMIN / OPERARIO → /admin/production
 *  - CLIENT / visitante → /catalog
 */
export default function Home() {
  return null;
}
