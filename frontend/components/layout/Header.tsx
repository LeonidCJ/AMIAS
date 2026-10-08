'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LogOut,
  LogIn,
  Scissors,
  Ruler,
} from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdminOrOperator, setIsAdminOrOperator] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    const savedName = localStorage.getItem('user_name');

    if (token) {
      setIsLoggedIn(true);
      setIsAdminOrOperator(role === 'ADMIN' || role === 'OPERARIO');
      setUserName(role === 'ADMIN' ? 'Admin Taller' : savedName || 'Carlos Rivas');
    } else {
      setIsLoggedIn(false);
      setIsAdminOrOperator(false);
      setUserName(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    setIsLoggedIn(false);
    setIsAdminOrOperator(false);
    setUserName(null);
    router.push('/login');
  };

  return (
    <header className="border-b border-[#e8e8e8] bg-white sticky top-0 z-40 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => router.push('/catalog')}
          className="text-left group cursor-pointer"
        >
          <span className="text-2xl font-extrabold tracking-[-0.04em] uppercase block leading-none text-[#121212]">
            AMIAS
          </span>
          <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-sans mt-1 block">
            Textile Studio Lima
          </span>
        </button>

        {/* Main Navigation Links matching login_user_normal.html */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.14em] font-semibold text-neutral-700">
          <button
            onClick={() => router.push('/catalog')}
            className={`py-1 border-b-2 transition ${
              pathname === '/catalog'
                ? 'border-[#121212] text-[#121212] font-bold'
                : 'border-transparent hover:text-neutral-950'
            }`}
          >
            Catálogo
          </button>

          {isLoggedIn && (
            <button
              onClick={() => router.push('/profile')}
              className={`py-1 border-b-2 transition flex items-center gap-1.5 ${
                pathname === '/profile'
                  ? 'border-[#121212] text-[#121212] font-bold'
                  : 'border-transparent hover:text-neutral-950'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Mi Perfil & Medidas</span>
            </button>
          )}

          {/* Admin / Operator Only Link */}
          {isLoggedIn && isAdminOrOperator && (
            <button
              onClick={() => router.push('/admin/production')}
              className={`py-1 border-b-2 transition flex items-center gap-1.5 ${
                pathname === '/admin/production'
                  ? 'border-[#121212] text-[#121212] font-bold'
                  : 'border-transparent hover:text-neutral-950'
              }`}
            >
              <Scissors className="w-3.5 h-3.5 text-amber-600" />
              <span>Taller & Producción</span>
            </button>
          )}
        </nav>

        {/* Session User Controls & Logout Button */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(isAdminOrOperator ? '/admin/production' : '/profile')}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-full hover:bg-neutral-200 transition cursor-pointer"
              >
                <span className="w-6 h-6 rounded-full bg-[#121212] text-white flex items-center justify-center text-[10px] font-bold font-mono">
                  {isAdminOrOperator ? 'AD' : 'CR'}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#121212]">
                  {userName || 'Carlos Rivas'}
                </span>
              </button>

              <button
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="px-3 py-1.5 border border-neutral-300 hover:border-red-600 hover:bg-red-50 text-neutral-700 hover:text-red-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="btn-dawn-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
