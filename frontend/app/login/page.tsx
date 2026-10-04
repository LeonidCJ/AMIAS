'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!email.trim() || !password.trim()) {
      setFeedback({ type: 'error', text: 'Debes ingresar tu correo y contraseña.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
      }

      // Store JWT token in localStorage for client-side API requests
      if (data.accessToken) {
        localStorage.setItem('access_token', data.accessToken);
      }

      setFeedback({
        type: 'success',
        text: '¡Sesión iniciada con éxito! Redirigiendo...',
      });

      setTimeout(() => {
        if (data.user?.role === 'ADMIN') {
          router.push('/admin/production');
        } else {
          router.push('/profile');
        }
      }, 1000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Error al conectar con el servidor de autenticación.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdminLogin = () => {
    setEmail('admin@amias.com');
    setPassword('Admin123456');
  };

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans selection:bg-neutral-900 selection:text-white flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-[#121212] text-white text-[11px] tracking-[0.15em] uppercase text-center py-2.5 px-4 font-semibold flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>ACCESO PRIVADO • AMIAS TEXTILE STUDIO LIMA 2026</span>
      </div>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header Brand */}
          <div className="text-center space-y-2">
            <span className="text-3xl font-extrabold tracking-[-0.04em] uppercase block leading-none">
              AMIAS
            </span>
            <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-sans block">
              Textile Studio Lima
            </span>
            <h1 className="text-xl font-bold uppercase text-[#121212] pt-4">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-neutral-500">
              Ingresa tus credenciales para acceder a tu perfil, rastreo de pedidos o consola de taller.
            </p>
          </div>

          {/* Alert Feedback */}
          {feedback && (
            <div
              className={`p-4 border text-xs font-semibold flex items-center gap-2 rounded-2xl ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-red-50 border-red-300 text-red-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5 border border-[#e8e8e8] p-8 rounded-3xl bg-white shadow-sm">
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-neutral-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@amias.com"
                className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] rounded-xl font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase font-bold text-neutral-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-500" />
                Contraseña *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] rounded-xl font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-dawn-primary w-full py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Fill Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="text-[11px] font-mono text-neutral-500 hover:text-neutral-900 underline transition"
              >
                ⚡ Rellenar credenciales de Demo Admin (admin@amias.com)
              </button>
            </div>
          </form>

          {/* Security Badge */}
          <div className="text-center text-[11px] text-neutral-400 font-sans flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Autenticación protegida con Argon2id + JWT HttpOnly</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e8e8] bg-[#fbfbfb] py-6 text-center text-[11px] text-neutral-400">
        © 2026 AMIAS Textile Studio. Todos los derechos reservados. Lima, Perú.
      </footer>
    </div>
  );
}
