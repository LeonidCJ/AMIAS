'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, LogIn } from 'lucide-react';
import { logout } from '../../lib/auth/session';

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    const savedName = localStorage.getItem('user_name');

    if (token && role === 'CLIENT') {
      setIsLoggedIn(true);
      setUserName(savedName || 'Mi Cuenta');
    } else {
      setIsLoggedIn(false);
      setUserName(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUserName(null);
    router.replace('/login');
  };

  // Compute initials dynamically e.g. "Juan Perez" -> "JP"
  const getInitials = (name: string | null) => {
    if (!name) return 'US';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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

        {/* Main Navigation Links matching landing_page_principal_y_cat_logo_textil.html prototype */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.14em] font-semibold text-neutral-700">
          <button
            onClick={() => router.push('/catalog')}
            className={`py-1 border-b-2 transition cursor-pointer ${
              pathname === '/catalog' || pathname?.startsWith('/catalog/')
                ? 'border-[#121212] text-[#121212] font-bold'
                : 'border-transparent hover:text-neutral-950'
            }`}
          >
            Catálogo
          </button>

          <button
            onClick={() => router.push('/custom')}
            className={`py-1 border-b-2 transition cursor-pointer ${
              pathname === '/custom'
                ? 'border-[#121212] text-[#121212] font-bold'
                : 'border-transparent hover:text-neutral-950'
            }`}
          >
            Personalizados
          </button>

          <button
            onClick={() => router.push('/about')}
            className={`py-1 border-b-2 transition cursor-pointer ${
              pathname === '/about'
                ? 'border-[#121212] text-[#121212] font-bold'
                : 'border-transparent hover:text-neutral-950'
            }`}
          >
            About
          </button>
        </nav>

        {/* Session User Controls & Clean Minimal Icon Logout Button */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/profile')}
                title="Ir a Mi Perfil & Medidas"
                className="flex items-center gap-2 px-3.5 py-1.5 bg-neutral-100 border border-neutral-200 rounded-full hover:bg-neutral-200 transition cursor-pointer"
              >
                <span className="w-6 h-6 rounded-full bg-[#121212] text-white flex items-center justify-center text-[10px] font-bold font-mono">
                  {getInitials(userName)}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#121212]">
                  {userName}
                </span>
              </button>

              <button
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="p-2 border border-neutral-200 hover:border-red-600 hover:bg-red-50 text-neutral-600 hover:text-red-600 rounded-full transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
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
