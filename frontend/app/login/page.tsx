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
  UserPlus,
  LogIn,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI States
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

      if (data.accessToken) {
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('user_role', data.user?.role || 'CLIENT');
        localStorage.setItem('user_name', data.user?.role === 'ADMIN' ? 'Admin Taller' : 'Carlos Rivas');
      }

      setFeedback({
        type: 'success',
        text: '¡Sesión iniciada con éxito! Redirigiendo...',
      });

      setTimeout(() => {
        if (data.user?.role === 'ADMIN' || data.user?.role === 'OPERARIO') {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!email.trim() || !password.trim()) {
      setFeedback({ type: 'error', text: 'Debes ingresar un correo y una contraseña.' });
      return;
    }

    if (password.length < 6) {
      setFeedback({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    try {
      setIsSubmitting(true);
      // Step 1: Register User
      const resReg = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const dataReg = await resReg.json();

      if (!resReg.ok) {
        throw new Error(dataReg.message || 'Error al registrar la cuenta.');
      }

      // Step 2: Auto-login after registration
      const resLogin = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const dataLogin = await resLogin.json();

      if (resLogin.ok && dataLogin.accessToken) {
        localStorage.setItem('access_token', dataLogin.accessToken);
        localStorage.setItem('user_role', 'CLIENT');
        localStorage.setItem('user_name', 'Carlos Rivas');
      }

      setFeedback({
        type: 'success',
        text: '¡Cuenta creada con éxito! Redirigiendo a tu perfil...',
      });

      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Error al registrar usuario.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoCustomer = () => {
    setEmail('carlos.rivas@gmail.com');
    setPassword('Admin123456');
    setActiveTab('login');
  };

  const handleQuickDemoAdmin = () => {
    setEmail('admin@amias.com');
    setPassword('Admin123456');
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-white text-[#121212] font-sans selection:bg-neutral-900 selection:text-white flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-[#121212] text-white text-[11px] tracking-[0.15em] uppercase text-center py-2.5 px-4 font-semibold flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>PORTAL DE ACCESO CLIENTES & TALLER • AMIAS LIMA 2026</span>
      </div>

      {/* Main Login/Register Card */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Header Brand */}
          <div className="text-center space-y-2">
            <span className="text-3xl font-extrabold tracking-[-0.04em] uppercase block leading-none">
              AMIAS
            </span>
            <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-sans block">
              Textile Studio Lima
            </span>
          </div>

          {/* Toggle Tabs: Iniciar Sesión vs Crear Cuenta */}
          <div className="flex border border-[#e8e8e8] bg-neutral-100 rounded-2xl p-1 gap-1">
            <button
              onClick={() => {
                setActiveTab('login');
                setFeedback(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition rounded-xl flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-white text-[#121212] shadow-sm border border-neutral-200'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('register');
                setFeedback(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition rounded-xl flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-white text-[#121212] shadow-sm border border-neutral-200'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Crear Cuenta</span>
            </button>
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

          {/* LOGIN FORM */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5 border border-[#e8e8e8] p-8 rounded-3xl bg-white shadow-sm">
              <div className="space-y-1">
                <h2 className="text-lg font-bold uppercase text-[#121212]">Bienvenido de vuelta</h2>
                <p className="text-xs text-neutral-500">
                  Ingresa tu correo para consultar tu historial, medidas o gestionar el taller.
                </p>
              </div>

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
                <span>{isSubmitting ? 'Verificando...' : 'Ingresar a Mi Cuenta'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo Helper Links */}
              <div className="pt-2 text-center space-y-1">
                <button
                  type="button"
                  onClick={handleQuickDemoCustomer}
                  className="text-[11px] font-mono text-neutral-600 hover:text-neutral-900 underline block mx-auto cursor-pointer"
                >
                  ⚡ Demo Comprador (carlos.rivas@gmail.com)
                </button>
                <button
                  type="button"
                  onClick={handleQuickDemoAdmin}
                  className="text-[11px] font-mono text-neutral-600 hover:text-neutral-900 underline block mx-auto cursor-pointer"
                >
                  ⚡ Demo Admin Taller (admin@amias.com)
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-5 border border-[#e8e8e8] p-8 rounded-3xl bg-white shadow-sm">
              <div className="space-y-1">
                <h2 className="text-lg font-bold uppercase text-[#121212]">Registro de Comprador</h2>
                <p className="text-xs text-neutral-500">
                  Crea tu cuenta en AMIAS para guardar tus medidas corporales y rastrear la confección de tus pedidos.
                </p>
              </div>

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
                  placeholder="tu.correo@gmail.com"
                  className="w-full px-3.5 py-3 border border-[#cccccc] text-xs focus:outline-none focus:border-[#121212] rounded-xl font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-neutral-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-neutral-500" />
                  Crear Contraseña * (Mín. 6 caracteres)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
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
                <span>{isSubmitting ? 'Creando Cuenta...' : 'Registrarme y Acceder'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

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
